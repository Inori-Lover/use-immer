import { Dispatch, SetStateAction } from "react";

function useImmer<S>(): [
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>
];
function useImmer<S>(init: S | (() => S)): [S, Dispatch<SetStateAction<S>>];

function useImmer<S>(init?: S | (() => S)) {
  return [] as any;
}

export { useImmer };
