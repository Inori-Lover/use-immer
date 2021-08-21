import produce, { enableMapSet } from "immer";
import { Dispatch, useReducer, useState, useCallback } from "react";

enableMapSet();

/** 可以返回nextState也可以原地修改然后不返回 */
export type SetStateAction<S> = S | ((prevState: S) => S | void);

/** immer 版的useState，因为immer的存在所以有一些限制与增强 */
function useImmer<S>(init: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const [initState] = useState(init);

  /** reducer声明在hook内是因为想要继承泛型，提出外部之后就没法type-safe了 */
  const reducer = useCallback((prevState: S, action: SetStateAction<S>): S => {
    let nextState = prevState;
    if (action instanceof Function) {
      // 经过校验，setState的行为就是这样：
      // 就算useState里传入的是function，setState只传func也是会运行并取返回值作为nextState
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
