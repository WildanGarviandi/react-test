import { createSelector } from 'reselect';

const getState = (state) => state.app.userLogged;

export const getLoginState = createSelector(
    [getState],
    (userLogged) => {
        const { isFetching, isValid, message, token } = userLogged;

        return {
            loginState: {
                isFetching,
                isError: (!isFetching && !isValid),
                message,
            },
            token,
        };
    }
);
