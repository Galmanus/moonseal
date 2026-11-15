use anchor_lang::prelude::*;

declare_id!("HuBV5gmKwQJvJuGvHLSY58hq2DE76khJYMrCzz6ipFYk");

/// Lunar direct-to-Earth contact coordination (DePIN on Solana).
/// The Lunar Command Window planner computes WHEN a lunar site can reach Earth;
/// this program coordinates the decentralized ground stations that serve those
/// contacts, and records the hash of the post-quantum (ML-DSA) signed command
/// relayed through the (untrusted) open network.
#[program]
pub mod lunar_contacts {
    use super::*;

    /// A ground station on Earth registers to serve lunar DTE contacts.
    pub fn register_station(ctx: Context<RegisterStation>, lat_e6: i32, lon_e6: i32, label: String) -> Result<()> {
        require!(label.len() <= 32, LunarError::LabelTooLong);
        let s = &mut ctx.accounts.station;
        s.authority = ctx.accounts.authority.key();
        s.lat_e6 = lat_e6;
        s.lon_e6 = lon_e6;
        s.label = label;
        s.contacts_served = 0;
        Ok(())
    }

    /// The mission planner posts a lunar contact window (from the planner tool).
    pub fn post_window(ctx: Context<PostWindow>, window_id: u64, start_ts: i64, end_ts: i64, site_lat_e6: i32, site_lon_e6: i32) -> Result<()> {
        require!(end_ts > start_ts, LunarError::BadWindow);
        let w = &mut ctx.accounts.window;
        w.window_id = window_id;
        w.mission = ctx.accounts.mission.key();
        w.start_ts = start_ts;
        w.end_ts = end_ts;
        w.site_lat_e6 = site_lat_e6;
        w.site_lon_e6 = site_lon_e6;
        w.station = Pubkey::default();
        w.status = WindowStatus::Open as u8;
        w.command_sig_hash = [0u8; 32];
        Ok(())
    }

    /// A registered station claims a contact window (scheduling).
    pub fn claim_window(ctx: Context<ClaimWindow>) -> Result<()> {
        let w = &mut ctx.accounts.window;
        require!(w.status == WindowStatus::Open as u8, LunarError::NotOpen);
        w.station = ctx.accounts.station.authority;
        w.status = WindowStatus::Claimed as u8;
        Ok(())
    }

    /// Station confirms it served the contact, recording the hash of the
    /// ML-DSA-signed command it relayed. This binds post-quantum command
    /// authentication to the on-chain coordination ledger.
    pub fn confirm_contact(ctx: Context<ConfirmContact>, command_sig_hash: [u8; 32]) -> Result<()> {
        let w = &mut ctx.accounts.window;
        require!(w.status == WindowStatus::Claimed as u8, LunarError::NotClaimed);
        require!(w.station == ctx.accounts.station.authority, LunarError::NotAssigned);
        w.status = WindowStatus::Served as u8;
        w.command_sig_hash = command_sig_hash;
        let s = &mut ctx.accounts.station;
        s.contacts_served = s.contacts_served.saturating_add(1);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct RegisterStation<'info> {
    #[account(init, payer = authority, space = 8 + Station::SIZE,
        seeds = [b"station", authority.key().as_ref()], bump)]
    pub station: Account<'info, Station>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(window_id: u64)]
pub struct PostWindow<'info> {
    #[account(init, payer = mission, space = 8 + ContactWindow::SIZE,
        seeds = [b"window", window_id.to_le_bytes().as_ref()], bump)]
    pub window: Account<'info, ContactWindow>,
    #[account(mut)]
    pub mission: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimWindow<'info> {
    #[account(mut)]
    pub window: Account<'info, ContactWindow>,
    #[account(seeds = [b"station", authority.key().as_ref()], bump, has_one = authority)]
    pub station: Account<'info, Station>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ConfirmContact<'info> {
    #[account(mut)]
    pub window: Account<'info, ContactWindow>,
    #[account(mut, seeds = [b"station", authority.key().as_ref()], bump, has_one = authority)]
    pub station: Account<'info, Station>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Station {
    pub authority: Pubkey,
    pub lat_e6: i32,
    pub lon_e6: i32,
    pub contacts_served: u64,
    pub label: String,
}
impl Station {
    pub const SIZE: usize = 32 + 4 + 4 + 8 + (4 + 32);
}

#[account]
pub struct ContactWindow {
    pub window_id: u64,
    pub mission: Pubkey,
    pub station: Pubkey,
    pub start_ts: i64,
    pub end_ts: i64,
    pub site_lat_e6: i32,
    pub site_lon_e6: i32,
    pub status: u8,
    pub command_sig_hash: [u8; 32],
}
impl ContactWindow {
    pub const SIZE: usize = 8 + 32 + 32 + 8 + 8 + 4 + 4 + 1 + 32;
}

#[repr(u8)]
pub enum WindowStatus {
    Open = 0,
    Claimed = 1,
    Served = 2,
}

#[error_code]
pub enum LunarError {
    #[msg("label too long")] LabelTooLong,
    #[msg("end must be after start")] BadWindow,
    #[msg("window not open")] NotOpen,
    #[msg("window not claimed")] NotClaimed,
    #[msg("station not assigned to this window")] NotAssigned,
}
