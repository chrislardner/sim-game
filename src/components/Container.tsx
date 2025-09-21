"use client";

import {cn} from "@/lib/cn";
import React from "react";

export default function Container({className, children,}: React.PropsWithChildren<{ className?: string }>) {
    return <div className={cn("page-x w-full", className)}>{children}</div>;
}
