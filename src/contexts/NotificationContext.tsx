/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useCallback, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import {
  Snackbar,
  SnackbarCloseReason,
  SnackbarProps,
  useThemeProps,
  Alert,
  AlertProps,
  AlertTitle,
} from '@mui/material';
import { ApolloError } from '@apollo/client';
import { BaseError, APIError, UnhandledError, GraphQLClientError } from '../api/errors';

type State = {
  isOpen: boolean;
  title?: string | JSX.Element;
  message: string | JSX.Element;
  snackbarProps: Omit<SnackbarProps, 'children' | 'open'>;
  defaultSnackbarProps: SnackbarProps;
  alertProps: Omit<AlertProps, 'children'>;
  defaultAlertProps: AlertProps;
};

enum ActionTypes {
  SET_DEFAULT_PROPS = 'SET_DEFAULT_PROPS',
  OPEN_NOTIFICATION = 'OPEN_NOTIFICATION',
  CLOSE_NOTIFICATION = 'CLOSE_NOTIFICATION',
  OPEN_ERROR_NOTIFICATION = 'OPEN_ERROR_NOTIFICATION',
}

type Action =
  | {
      type: ActionTypes.SET_DEFAULT_PROPS;
      snackbarProps: SnackbarProps;
      alertProps: AlertProps;
    }
  | {
      type: ActionTypes.OPEN_NOTIFICATION;
      title?: string | JSX.Element;
      message: string | JSX.Element;
      snackbarProps?: Omit<SnackbarProps, 'children' | 'open' | 'message'>;
      alertProps?: Omit<AlertProps, 'children'>;
    }
  | {
      type: ActionTypes.CLOSE_NOTIFICATION;
    }
  | {
      type: ActionTypes.OPEN_ERROR_NOTIFICATION;
      error: BaseError;
    };

const initialState: State = {
  isOpen: false,
  title: undefined,
  message: '',
  snackbarProps: {},
  defaultSnackbarProps: {},
  alertProps: {},
  defaultAlertProps: {},
};

const NotificationContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

const { Provider } = NotificationContext;

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionTypes.SET_DEFAULT_PROPS:
      return {
        ...state,
        defaultSnackbarProps: action.snackbarProps,
        defaultAlertProps: action.alertProps,
      };
    case ActionTypes.OPEN_NOTIFICATION:
      return {
        ...initialState,
        isOpen: true,
        title: action.title,
        message: action.message,
        snackbarProps: {
          ...state.defaultSnackbarProps,
          ...action.snackbarProps,
        },
        alertProps: {
          ...state.defaultAlertProps,
          ...action.alertProps,
        },
        defaultSnackbarProps: state.defaultSnackbarProps,
        defaultAlertProps: state.defaultAlertProps,
      };
    case ActionTypes.CLOSE_NOTIFICATION:
      return {
        ...state,
        isOpen: false,
      };
    case ActionTypes.OPEN_ERROR_NOTIFICATION:
      return {
        ...initialState,
        isOpen: true,
        title: action.error.title,
        message: action.error.message,
        snackbarProps: {
          ...state.defaultSnackbarProps,
        },
        alertProps: {
          ...state.defaultAlertProps,
          ...{ severity: 'error' },
        },
        defaultSnackbarProps: state.defaultSnackbarProps,
        defaultAlertProps: state.defaultAlertProps,
      };
    default:
      throw new Error(`NotificationContext: Action not found`);
  }
};

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const NotificationProvider: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [isDefaultPropsSetup, setIsDefaultPropsSetup] = useState<boolean>(false);

  const themeSnackbarProps = useThemeProps({
    props: state.defaultSnackbarProps,
    name: 'MuiSnackbar',
  });
  const themeAlertProps = useThemeProps({
    props: state.defaultAlertProps,
    name: 'MuiAlert',
  });

  // Snackbar default close handler
  const onSnackbarCloseHandler = useCallback(
    (event: React.SyntheticEvent<unknown, Event>, reason: SnackbarCloseReason) => {
      if (reason === 'clickaway') {
        return;
      }
      dispatch({ type: ActionTypes.CLOSE_NOTIFICATION });
    },
    [],
  );
  // Alert default close handler
  const onAlertCloseHandler = useCallback((event: React.SyntheticEvent<unknown, Event>) => {
    dispatch({ type: ActionTypes.CLOSE_NOTIFICATION });
  }, []);
  // Set the default handlers in the Context's state
  useEffect(() => {
    if (isDefaultPropsSetup) {
      return;
    }
    dispatch({
      type: ActionTypes.SET_DEFAULT_PROPS,
      snackbarProps: {
        ...themeSnackbarProps,
        autoHideDuration: 6000,
        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
        onClose: onSnackbarCloseHandler,
      },
      alertProps: { ...themeAlertProps, variant: 'filled', onClose: onAlertCloseHandler },
    });
    setIsDefaultPropsSetup(true);
  }, [
    isDefaultPropsSetup,
    dispatch,
    themeSnackbarProps,
    themeAlertProps,
    onSnackbarCloseHandler,
    onAlertCloseHandler,
  ]);

  return (
    <Provider value={{ state, dispatch }}>
      {children}
      <Snackbar {...state.snackbarProps} open={state.isOpen}>
        <Alert {...state.alertProps}>
          {state.title && <AlertTitle>{state.title}</AlertTitle>}
          {state.message}
        </Alert>
      </Snackbar>
    </Provider>
  );
};

const openDefaultErrorNotification = (error: unknown, dispatch: React.Dispatch<Action>) => {
  let processedError;
  if (axios.isAxiosError(error)) {
    processedError = new APIError(error.response.status);
  } else if (error instanceof ApolloError) {
    if (error.networkError) {
      const networkError = error.networkError as any;
      if (networkError.statusCode) {
        processedError = new APIError(networkError.statusCode);
      }
    } else if (error.graphQLErrors) {
      const graphQLError = error.graphQLErrors[0];
      processedError = new GraphQLClientError(graphQLError);
    }
  }
  if (!processedError) {
    console.error(error);
    processedError = new UnhandledError(error);
  }
  dispatch({ type: ActionTypes.OPEN_ERROR_NOTIFICATION, error: processedError });
};

export { NotificationContext, NotificationProvider, ActionTypes, openDefaultErrorNotification };
