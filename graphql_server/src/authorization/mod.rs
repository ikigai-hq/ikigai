pub mod class_auth;
pub mod document_auth;
pub mod organization_auth;
pub mod user_auth;

pub use class_auth::*;
pub use document_auth::*;
pub use organization_auth::*;
pub use user_auth::*;

use oso::{ClassBuilder, Oso, PolarClass};

pub fn init_oso() -> Oso {
    let mut oso = Oso::new();

    let user_class_builder: ClassBuilder<UserAuth> = UserAuth::get_polar_class_builder();
    oso.register_class(
        user_class_builder
            .add_attribute_getter("role", |user| user.get_role())
            .build(),
    )
    .unwrap();

    let org_builder: ClassBuilder<OrganizationAuth> = OrganizationAuth::get_polar_class_builder();
    oso.register_class(org_builder.build()).unwrap();

    let class_builder: ClassBuilder<ClassAuth> = ClassAuth::get_polar_class_builder();
    oso.register_class(class_builder.build()).unwrap();

    let document_builder: ClassBuilder<DocumentAuth> = DocumentAuth::get_polar_class_builder();
    oso.register_class(document_builder.build()).unwrap();

    oso.load_files(vec!["authorization.polar"]).unwrap();

    oso
}
