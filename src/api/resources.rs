use crate::api::crud::CrudAdapter;
use crate::entities::{admin, employee, partner, state};
use sea_orm::{ActiveValue, IntoActiveModel};
use serde::Deserialize;
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

#[derive(Deserialize)]
pub struct CreateEmployeeDto {
    pub id: Uuid,
    pub balance: Option<f32>,
}

#[derive(Deserialize)]
pub struct UpdateEmployeeDto {
    pub balance: Option<f32>,
}

pub struct EmployeeAdapter;

impl CrudAdapter<employee::Entity> for EmployeeAdapter {
    type CreateDto = CreateEmployeeDto;
    type UpdateDto = UpdateEmployeeDto;

    fn to_active_model(dto: Self::CreateDto) -> employee::ActiveModel {
        employee::ActiveModel {
            id: ActiveValue::Set(dto.id),
            balance: ActiveValue::Set(dto.balance),
            ..Default::default()
        }
    }

    fn apply_update(dto: Self::UpdateDto, model: employee::Model) -> employee::ActiveModel {
        let mut am = model.into_active_model();
        if let Some(b) = dto.balance {
            am.balance = ActiveValue::Set(Some(b));
        }
        am
    }
}

#[derive(Deserialize)]
pub struct CreatePartnerDto {
    pub id: Uuid,
    pub siren: Option<i32>,
    pub social_obj: Option<String>,
    pub category: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdatePartnerDto {
    pub social_obj: Option<String>,
    pub highlight: Option<bool>,
    pub verification: Option<bool>,
}

pub struct PartnerAdapter;

impl CrudAdapter<partner::Entity> for PartnerAdapter {
    type CreateDto = CreatePartnerDto;
    type UpdateDto = UpdatePartnerDto;

    fn to_active_model(dto: Self::CreateDto) -> partner::ActiveModel {
        partner::ActiveModel {
            id: ActiveValue::Set(dto.id),
            siren: ActiveValue::Set(dto.siren),
            social_obj: ActiveValue::Set(dto.social_obj),
            category: ActiveValue::Set(dto.category),
            ..Default::default()
        }
    }

    fn apply_update(dto: Self::UpdateDto, model: partner::Model) -> partner::ActiveModel {
        let mut am = model.into_active_model();
        if let Some(s) = dto.social_obj {
            am.social_obj = ActiveValue::Set(Some(s));
        }
        if let Some(h) = dto.highlight {
            am.highlight = ActiveValue::Set(Some(h));
        }
        if let Some(v) = dto.verification {
            am.verification = ActiveValue::Set(Some(v));
        }
        am
    }
}

#[derive(Deserialize)]
pub struct CreateStateDto {
    pub id: Uuid,
    pub state: String,
    pub reason: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateStateDto {
    pub state: Option<String>,
    pub reason: Option<String>,
}

pub struct StateAdapter;

impl CrudAdapter<state::Entity> for StateAdapter {
    type CreateDto = CreateStateDto;
    type UpdateDto = UpdateStateDto;

    fn to_active_model(dto: Self::CreateDto) -> state::ActiveModel {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;

        state::ActiveModel {
            id: ActiveValue::Set(dto.id),
            state: ActiveValue::Set(dto.state),
            reason: ActiveValue::Set(dto.reason),
            modified_at: ActiveValue::Set(now),
        }
    }

    fn apply_update(dto: Self::UpdateDto, model: state::Model) -> state::ActiveModel {
        let mut am = model.into_active_model();
        if let Some(s) = dto.state {
            am.state = ActiveValue::Set(s);
        }
        if let Some(r) = dto.reason {
            am.reason = ActiveValue::Set(Some(r));
        }
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;
        am.modified_at = ActiveValue::Set(now);
        am
    }
}

#[derive(Deserialize)]
pub struct CreateAdminDto {
    pub id: Uuid,
}

#[derive(Deserialize)]
pub struct UpdateAdminDto {}

pub struct AdminAdapter;

impl CrudAdapter<admin::Entity> for AdminAdapter {
    type CreateDto = CreateAdminDto;
    type UpdateDto = UpdateAdminDto;

    fn to_active_model(dto: Self::CreateDto) -> admin::ActiveModel {
        admin::ActiveModel {
            id: ActiveValue::Set(dto.id),
        }
    }

    fn apply_update(_dto: Self::UpdateDto, model: admin::Model) -> admin::ActiveModel {
        model.into_active_model()
    }
}
