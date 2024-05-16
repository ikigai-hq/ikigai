// @generated automatically by Diesel CLI.

diesel::table! {
    assignment_submissions (id) {
        id -> Int4,
        assignment_id -> Int4,
        user_id -> Int4,
        temp_grade -> Nullable<Float8>,
        feedback -> Nullable<Text>,
        updated_at -> Int8,
        created_at -> Int8,
        document_id -> Uuid,
        attempt_number -> Int4,
        final_grade -> Nullable<Float8>,
        start_at -> Int8,
        feedback_at -> Nullable<Int8>,
        allow_for_student_view_answer -> Bool,
        submit_at -> Nullable<Int8>,
        allow_rework -> Bool,
        can_change_structure -> Bool,
    }
}

diesel::table! {
    assignments (id) {
        id -> Int4,
        updated_at -> Int8,
        created_at -> Int8,
        document_id -> Uuid,
        graded_type -> Int4,
        max_number_of_attempt -> Nullable<Int4>,
        pre_description -> Nullable<Text>,
        test_duration -> Nullable<Int4>,
        band_score_id -> Nullable<Int4>,
        grade_method -> Int4,
        force_auto_submit -> Bool,
        allow_submission_change_structure -> Bool,
        grade_by_rubric_id -> Nullable<Uuid>,
        weighting_into_final_grade -> Float8,
    }
}

diesel::table! {
    band_scores (id) {
        id -> Int4,
        name -> Varchar,
        range -> Jsonb,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    document_assigned_users (document_id, assigned_user_id) {
        document_id -> Uuid,
        assigned_user_id -> Int4,
        created_at -> Int8,
    }
}

diesel::table! {
    documents (id) {
        id -> Uuid,
        creator_id -> Int4,
        parent_id -> Nullable<Uuid>,
        cover_photo_id -> Nullable<Uuid>,
        index -> Int4,
        title -> Text,
        deleted_at -> Nullable<Int8>,
        updated_by -> Nullable<Int4>,
        last_edited_content_at -> Int8,
        updated_at -> Int8,
        created_at -> Int8,
        space_id -> Nullable<Int4>,
        icon_type -> Nullable<Int4>,
        icon_value -> Nullable<Varchar>,
    }
}

diesel::table! {
    files (uuid) {
        uuid -> Uuid,
        user_id -> Int4,
        status -> Int4,
        public -> Bool,
        file_name -> Varchar,
        content_type -> Varchar,
        content_length -> Int8,
        updated_at -> Int8,
        created_at -> Int8,
        download_cached_url -> Nullable<Varchar>,
        download_url_expire_in -> Nullable<Int8>,
        waveform_audio_json_str -> Nullable<Text>,
    }
}

diesel::table! {
    notification_receivers (notification_id, user_id) {
        notification_id -> Uuid,
        user_id -> Int4,
        created_at -> Int8,
    }
}

diesel::table! {
    notifications (id) {
        id -> Uuid,
        notification_type -> Int4,
        context -> Jsonb,
        created_at -> Int8,
    }
}

diesel::table! {
    page_contents (id) {
        id -> Uuid,
        page_id -> Uuid,
        index -> Int4,
        updated_at -> Int8,
        created_at -> Int8,
        body -> Jsonb,
    }
}

diesel::table! {
    pages (id) {
        id -> Uuid,
        document_id -> Uuid,
        index -> Int4,
        title -> Text,
        layout -> Int4,
        created_by_id -> Int4,
        deleted_at -> Nullable<Int8>,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    rubric_submissions (submission_id) {
        submission_id -> Int4,
        rubric_id -> Nullable<Uuid>,
        graded_data -> Jsonb,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    rubrics (id) {
        id -> Uuid,
        name -> Text,
        data -> Jsonb,
        updated_at -> Int8,
        created_at -> Int8,
        user_id -> Int4,
    }
}

diesel::table! {
    space_invite_tokens (space_id, token) {
        space_id -> Int4,
        token -> Varchar,
        creator_id -> Int4,
        inviting_role -> Int4,
        expire_at -> Nullable<Int8>,
        uses -> Int4,
        is_active -> Bool,
        created_at -> Int8,
    }
}

diesel::table! {
    space_members (space_id, user_id) {
        space_id -> Int4,
        user_id -> Int4,
        updated_at -> Int8,
        created_at -> Int8,
        join_by_token -> Nullable<Varchar>,
        role -> Int4,
    }
}

diesel::table! {
    spaces (id) {
        id -> Int4,
        name -> Text,
        updated_at -> Int8,
        created_at -> Int8,
        banner_id -> Nullable<Uuid>,
        creator_id -> Int4,
        deleted_at -> Nullable<Int8>,
    }
}

diesel::table! {
    user_activities (user_id) {
        user_id -> Int4,
        last_document_id -> Nullable<Uuid>,
    }
}

diesel::table! {
    users (id) {
        id -> Int4,
        email -> Varchar,
        first_name -> Varchar,
        last_name -> Varchar,
        updated_at -> Int8,
        created_at -> Int8,
        avatar_file_id -> Nullable<Uuid>,
    }
}

diesel::joinable!(assignment_submissions -> assignments (assignment_id));
diesel::joinable!(assignment_submissions -> documents (document_id));
diesel::joinable!(assignment_submissions -> users (user_id));
diesel::joinable!(assignments -> band_scores (band_score_id));
diesel::joinable!(assignments -> documents (document_id));
diesel::joinable!(assignments -> rubrics (grade_by_rubric_id));
diesel::joinable!(document_assigned_users -> documents (document_id));
diesel::joinable!(document_assigned_users -> users (assigned_user_id));
diesel::joinable!(documents -> files (cover_photo_id));
diesel::joinable!(documents -> spaces (space_id));
diesel::joinable!(notification_receivers -> notifications (notification_id));
diesel::joinable!(notification_receivers -> users (user_id));
diesel::joinable!(page_contents -> pages (page_id));
diesel::joinable!(pages -> documents (document_id));
diesel::joinable!(pages -> users (created_by_id));
diesel::joinable!(rubric_submissions -> assignment_submissions (submission_id));
diesel::joinable!(rubric_submissions -> rubrics (rubric_id));
diesel::joinable!(rubrics -> users (user_id));
diesel::joinable!(space_invite_tokens -> spaces (space_id));
diesel::joinable!(space_invite_tokens -> users (creator_id));
diesel::joinable!(space_members -> spaces (space_id));
diesel::joinable!(space_members -> users (user_id));
diesel::joinable!(spaces -> files (banner_id));
diesel::joinable!(spaces -> users (creator_id));
diesel::joinable!(user_activities -> documents (last_document_id));
diesel::joinable!(user_activities -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    assignment_submissions,
    assignments,
    band_scores,
    document_assigned_users,
    documents,
    files,
    notification_receivers,
    notifications,
    page_contents,
    pages,
    rubric_submissions,
    rubrics,
    space_invite_tokens,
    space_members,
    spaces,
    user_activities,
    users,
);
