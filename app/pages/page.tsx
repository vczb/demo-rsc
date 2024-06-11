import React, { Suspense } from 'react';
import Hello from '../components/Hello';
import Wrapper from '../components/Wrapper';

export default function Page(){
  return <Wrapper>
    <Suspense fallback={<div>Loading...</div>}>
      <Hello value='Home page' />
    </Suspense>
  </Wrapper>
}
