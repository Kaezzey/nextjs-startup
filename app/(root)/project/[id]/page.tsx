import React from 'react'

const page = async ( {params}: {params: Promise <{id: string}>}) => {
    const id = (await params).id;

  return (
    <h1>This is a startup number: {id}</h1>
  )
}

export default page