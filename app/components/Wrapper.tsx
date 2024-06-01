import React, { ReactNode } from "react";

type WrapperProps = {
  children: ReactNode | ReactNode[]
}

const Wrapper = ({children}:WrapperProps) => {
  return <div>{children}</div>
}

export default Wrapper