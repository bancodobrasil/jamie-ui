enum Status {
  PENDING = 'PENDING',
  SUCCESSS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type WrapPromise<T> = { read: () => T };

// Helper method to be used with React.Suspense
const wrapPromise = <T>(promise: Promise<T>): WrapPromise<T> => {
  let status = Status.PENDING;
  let response;

  const suspender = promise.then(
    res => {
      status = Status.SUCCESSS;
      response = res;
    },
    err => {
      status = Status.ERROR;
      response = err;
    },
  );

  const read = (): T => {
    switch (status) {
      case Status.PENDING:
        throw suspender;
      case Status.ERROR:
        throw response;
      default:
        return response;
    }
  };

  return { read };
};

export default wrapPromise;
