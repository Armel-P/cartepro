use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "transaction")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,

    pub timestamp: i64,
    pub success: bool,
    pub value: f32,
    pub partner_id: Uuid,
    pub employee_id: Uuid,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "crate::entities::partner::Entity",
        from = "Column::PartnerId",
        to = "crate::entities::partner::Column::Id"
    )]
    Partner,
    #[sea_orm(
        belongs_to = "crate::entities::employee::Entity",
        from = "Column::EmployeeId",
        to = "crate::entities::employee::Column::Id"
    )]
    Employee,
}

impl Related<crate::entities::partner::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Partner.def()
    }
}

impl Related<crate::entities::employee::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Employee.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
