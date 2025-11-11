import { http } from '../../shared/lib/api';

// Domain types used by the app (teachers authenticate)
export type TeacherUser = { id: number | string; email: string };

// Request/response contracts
export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string; user: TeacherUser };
export type MeResponse = TeacherUser;

const AUTH_LOGIN_PATH = '/auth/login';
const AUTH_ME_PATH = '/auth/me';

// ✅ Perform login and adapt backend response
export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
    const res = await http.post<{ token: string; teacher?: TeacherUser }>(AUTH_LOGIN_PATH, payload);

    if (!res?.token || !res?.teacher) {
        throw new Error('Invalid login response');
    }

    return {
        token: res.token,
        user: res.teacher, // ✅ Adapt backend "teacher" to expected "user"
    };
}

// ✅ Get the current logged-in user
export async function meApi(): Promise<MeResponse> {
    const res = await http.get<MeResponse>(AUTH_ME_PATH);
    if (!res || typeof res !== 'object') {
        throw new Error('Invalid me response');
    }
    return res;
}
