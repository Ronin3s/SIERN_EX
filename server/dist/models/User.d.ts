import mongoose, { Document } from 'mongoose';
import { RoleValues } from 'shared';
export interface IUser extends Document {
    email: string;
    password: string | null;
    createdAt: Date;
    lastLoginAt: Date;
    isActive: boolean;
    role: RoleValues;
    refreshToken: string;
    oauthProvider?: string;
    oauthId?: string;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map