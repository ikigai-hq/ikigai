actor UserAuth {}

#################################################
###### Organization Resource Authorization ######
#################################################

allow(actor: UserAuth, action, organization: OrganizationAuth) if
    has_permission(actor, action, organization);

resource OrganizationAuth {
    roles = ["Student", "Teacher"];
    permissions = [
        "view_member_public_information",
        "edit_org_member_information",
        "add_org_member",
        "remove_org_member",
        "add_class",
        "remove_class",
        "manage_template",
        "manage_trash",
        "manage_org_information",
    ];

    "view_member_public_information" if "Student";

    "Student" if "Teacher";
    "edit_org_member_information" if "Teacher";
    "add_org_member" if "Teacher";
    "remove_org_member" if "Teacher";
    "add_class" if "Teacher";
    "remove_class" if "Teacher";
    "manage_template" if "Teacher";
    "manage_trash" if "Teacher";
    "manage_org_information" if "Teacher";
}

has_role(user: UserAuth, role: String, organization: OrganizationAuth) if
    user.org_id = organization.id and
    user.role = role;

#########################################
###### Class Resource Authorization #####
#########################################

allow(user: UserAuth, action, class: ClassAuth) if
    has_permission(user, action, class);

allow(user: UserAuth, "self_enroll", class: ClassAuth) if
	has_role(user, "Student", class) and
	class.allow_student_self_enroll;

resource ClassAuth {
    roles = ["Student", "Teacher"];
    permissions = [
		"view_class_content",
		"self_enroll",
		"manage_class_content",
		"manage_class_member",
		"manage_class_setting",
    ];

	"view_class_content" if "Student";

	"Student" if "Teacher";
	"manage_class_content" if "Teacher";
	"manage_class_member" if "Teacher";
	"manage_class_setting" if "Teacher";
}

has_role(user: UserAuth, "Teacher", class: ClassAuth) if
    user.org_id = class.org_id and
    user.role = "Teacher";

has_role(user: UserAuth, role: String, class: ClassAuth) if
    user.org_id = class.org_id and
    user.role = role and
    class.has_this_member;

############################################
###### Document Resource Authorization #####
############################################

allow(actor: UserAuth, action, doc: DocumentAuth) if
    has_permission(actor, action, doc);

allow(actor: UserAuth, "view_answer", doc: DocumentAuth) if
    (doc.allow_for_student_view_answer and doc.creator_id = actor.id) or
    has_permission(actor, "view_answer", doc);

allow(actor: UserAuth, "interactive_with_tool", doc: DocumentAuth) if
	doc.is_doing_submission and
	doc.org_id = actor.org_id and
	doc.creator_id = actor.id and
	actor.role = "Student";

allow(actor: UserAuth, "interactive_with_tool", doc: DocumentAuth) if
	not doc.is_doing_submission and
	doc.org_id = actor.org_id and
	actor.org_role = "Teacher";

allow(actor: UserAuth, "edit_document", doc: DocumentAuth) if
	(doc.is_doing_open_type_submission and doc.org_id = actor.org_id and doc.creator_id = actor.id) and
    has_permission(actor, "edit_document", doc);

resource DocumentAuth {
    roles = ["Reader", "Writer"];
    permissions = [
        "view_document",
        "interactive_with_tool",
        "view_answer",
        "edit_document",
        "manage_document",
    ];

    "view_document" if "Reader";

    "Reader" if "Writer";
    "view_answer" if "Writer";
    "edit_document" if "Writer";
    "manage_document" if "Writer";
}

has_role(user: UserAuth, "Writer", doc: DocumentAuth) if
    user.org_id = doc.org_id and user.id = doc.creator_id;

has_role(user: UserAuth, "Writer", doc: DocumentAuth) if
    user.org_id = doc.org_id and
    user.role = "Teacher";

has_role(user: UserAuth, "Reader", doc: DocumentAuth) if
    user.org_id = doc.org_id;

has_role(_: UserAuth, "Reader", doc: DocumentAuth) if
    doc.is_public;
