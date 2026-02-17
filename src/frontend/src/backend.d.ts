import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface FileMetadata {
    id: string;
    blob: ExternalBlob;
    fileName: string;
    uploadTime: Time;
}
export interface AdSenseConfig {
    enableFooterBanner: boolean;
    enableToolSectionAds: boolean;
    publisherId: string;
    enableHeaderBanner: boolean;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteFile(fileId: string): Promise<void>;
    getAdSenseConfig(): Promise<AdSenseConfig>;
    getCallerFiles(): Promise<Array<FileMetadata>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFileMetadata(fileId: string): Promise<FileMetadata>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAdSenseConfig(newConfig: AdSenseConfig): Promise<void>;
    uploadFile(fileName: string, blob: ExternalBlob): Promise<void>;
}
