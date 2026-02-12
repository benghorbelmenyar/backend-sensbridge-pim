export declare const USER_PROFILE_TYPES: readonly ["Sourd", "Malentendant", "Aveugle", "Malvoyant", "Parent", "Aidant", "Mixte", "NORMAL_PERSON", "DEAF_PERSON", "ORGANIZATION"];
export declare class CreateUserDto {
    displayName: string;
    email: string;
    profileType: string;
    disabilities?: string[];
    phoneNumber?: string;
    dateOfBirth?: string;
    isActive?: boolean;
}
