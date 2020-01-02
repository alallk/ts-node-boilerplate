import {IUserCreateDto, ISearchAndFilter, IUser, User} from "../models/User";
import {Types} from "mongoose";
import {IPaginateResult} from "../interfaces/miscInterfaces";
import {InternalServerError, ServerError} from "../utils";
import * as log4js from "log4js";

export class UserService {
    private logger = log4js.getLogger("UserService");

    public async getMe(request): Promise<IUser> {
        try {
            const objectId = Types.ObjectId(request.user.id);
            return await User.findById(objectId);
        } catch (error) {
            this.handleError(error);
        }
    }

    public async get(id: string): Promise<IUser> {
        try {
            const objectId = Types.ObjectId(id);
            let user = await User.findById(objectId);
            if (!user) this.handleError(null);
            return user;
        } catch (error) {
            this.handleError(error);
        }
    }

    public async create(body: IUserCreateDto): Promise<IUser> {
        try {
            return await User.create(body);
        } catch (error) {
            console.error(error);
            if (error) {
                this.handleError(error);
            }
        }
    }

    public async update(id: string, body: IUser): Promise<IUser> {
        try {
            return await User.findOneAndUpdate(id, body);
        } catch (error) {
            this.handleError(error);
        }
    }

    public async delete(id: string): Promise<IUser> {
        try {
            return await User.findByIdAndRemove(id);
        } catch (error) {
            this.handleError(error);
        }
    }

    public async paginate(page: number = 1, limit: number = 10, sortAsc: boolean = true, fieldSort: string = '_id',
                          searchAndFilter: ISearchAndFilter = {
                              query: {},
                              filter: {}
                          }): Promise<IPaginateResult<IUser>> {
        const sort = {};
        sort[fieldSort] = sortAsc ? 1 : -1;
        try {
            return await User.paginate(searchAndFilter.query, {
                page: page,
                limit: limit,
                sort: sort,
                select: searchAndFilter.filter
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    public handleError(error: any) {
        console.error(error);
        this.logger.error(error);
        if (error instanceof ServerError) throw error;
        const invalidId = 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters';
        if (!error || error.message == invalidId) {
            throw new ServerError(404);
        } else if (error.name === 'MongoError' && error.code === 11000) {
            throw new ServerError(409);
        } else {
            // throw new ServerError();
            throw new ServerError( 500,[new InternalServerError(error.message, error.stack)]);
            // let serverError: ServerError = {
            //     status: 500,
            //     internalServerErrors: [new InternalServerError(error.message, error.stack)]
            // };
            // throw serverError;
        }
    }
}