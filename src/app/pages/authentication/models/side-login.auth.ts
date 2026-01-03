export interface LoginRequest {
    user_login: string;
    access_key: string;
}

export interface UserEntity {
    id: number;
    createdAt: string;
    creatorId: number;

    user_login: string;
    access_key: string;
    last_name: string;
    first_name: string;
    email: string;
    contact: string;
    status: number;
}

export interface MenuItem {
    state: string;
    name: string;
    type: string;
    icon: string;
    expanded: string;
}

export interface LoginResponse {
    autenticated: boolean;
    accessToken: string;
    user: UserEntity;
    menu: MenuItem[];
}