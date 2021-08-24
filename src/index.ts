import produce, {
  enableMapSet,
  enablePatches,
  applyPatches,
  Patch,
} from "immer";
import {
  Dispatch,
  useReducer,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";

enableMapSet();
enablePatches();

/** 可以返回nextState也可以原地修改然后不返回 */
export type SetStateAction<S> = S | ((prevState: S) => S | void);

/** 返回immer相关增强功能 */
export interface ImmerActions {
  /** 返回patch数组，长度为0时则代表数据(即使被多次修改后)相比初始值没变化 */
  patches: () => Patch[];
}

/** immer 版的useState，因为immer的存在所以有一些限制与增强 */
function useImmer<S>(
  init: S | (() => S)
): [S, Dispatch<SetStateAction<S>>, ImmerActions] {
  const [initState] = useState(init);
  /** 记录patch信息数组 */
  const patchesRef = useRef<Patch[]>([]);
  /** patch信息数组在上次压缩后是否被修改过 */
  const dirtyMarkRef = useRef(false);

  if (typeof initState === "function") {
    console.warn(
      "不推荐在useState/useImmer中记录函数，会破坏setState操作的type-safe"
    );
  }

  /** reducer声明在hook内是因为想要继承泛型，提出外部之后就没法type-safe了 */
  const reducer = useCallback((prevState: S, action: SetStateAction<S>): S => {
    let nextState = prevState;
    if (action instanceof Function) {
      // 经过校验，setState的行为就是这样：
      // 就算useState里传入的是function，setState只传func也是会运行并取返回值作为nextState
      nextState = produce(prevState, action, (patches) =>
        patchesRef.current.push(...patches)
      );
    } else {
      nextState = produce(
        prevState,
        () => action,
        (patches) => patchesRef.current.push(...patches)
      );
    }

    dirtyMarkRef.current = true;
    return nextState;
  }, []);

  const [state, dispatch] = useReducer(reducer, initState);

  const setState: Dispatch<SetStateAction<S>> = useCallback((setAction) => {
    dispatch(setAction);
  }, []);

  const immerActions: ImmerActions = useMemo(
    () => ({
      patches() {
        if (dirtyMarkRef.current) {
          /** 通过 immer.applyPatches 将patch信息尽可能压缩 */
          produce(
            initState,
            (draft) => {
              applyPatches(draft, patchesRef.current);
            },
            (compressedPatches) => {
              patchesRef.current = compressedPatches;
            }
          );
          dirtyMarkRef.current = false;
        }
        return patchesRef.current;
      },
    }),
    [initState]
  );

  return [state, setState, immerActions];
}

export { useImmer };
