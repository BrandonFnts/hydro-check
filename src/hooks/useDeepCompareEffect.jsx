import { useEffect, useRef } from "react";
import { isDeepEqual } from "@/helpers/compareHelper";

const useDeepCompareMemoize = (value) => {
    const ref = useRef(value);

    if (!isDeepEqual(value, ref.current)) {
        ref.current = value;
    }

    return ref.current;
};

export const useDeepCompareEffect = (callback, dependencies) => {
    useEffect(callback, useDeepCompareMemoize(dependencies));
};