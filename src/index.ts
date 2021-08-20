import produce, { enableMapSet } from "immer";
import { Dispatch, useReducer, useState, useCallback } from "react";

enableMapSet();

export type SetStateAction<S> = S | ((prevState: S) => S | void);

/** immer 版的useState，因为immer的存在所以有一些限制与增强 */
function useImmer<S>(init: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const [initState] = useState(init);

  const reducer = useCallback((prevState: S, action: SetStateAction<S>): S => {
    let nextState = prevState;
    if (action instanceof Function) {
      nextState = produce(prevState, action);
    } else {
      nextState = action;
    }

    return nextState;
  }, []);
  const [state, dispatch] = useReducer(reducer, initState);

  const setState: Dispatch<SetStateAction<S>> = useCallback((setAction) => {
    dispatch(setAction);
  }, []);

  return [state, setState];
}

export { useImmer };
