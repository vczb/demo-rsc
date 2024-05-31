import React from "react"

type HelloProps = {
  value: string
}

const Hello = ({value}: HelloProps) => {
  return <h1>Hello {value}</h1>
}

export default Hello