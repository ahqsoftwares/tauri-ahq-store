import { User, Auth } from 'firebase/auth';
import React, { FunctionComponent } from 'react';
import type { IDefault } from '../resources/settings';

export interface IUserProps extends IDefault {
    auth: Auth;
}

export interface IAccountNameProps extends IDefault{
    close: () => void;
    user: User;
    updateName: (value: string) => void;
}

export interface IDeleteAccountProps extends IDefault {
    auth: Auth;
    cancel: () => void;
    pass: string;
    set: {
        pwd: React.Dispatch<React.SetStateAction<string>>
    }
}

export interface IActions {
    auth: Auth;
    deleteAcc: React.Dispatch<React.SetStateAction<boolean>>
}


export interface IProfilePictureData {
    fs: { result: string }
}