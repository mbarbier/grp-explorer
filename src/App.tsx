import React from 'react';
import { FileProvider, LoadingProvider } from './Contexts';

import './Style.scss';

import { Content } from './ui/Content';
import { Header } from './ui/Header';
import { Sidebar } from './ui/SideBar';

export function App() {



  return (
    <div className="app">
      <LoadingProvider>
        <FileProvider>
          <Header></Header>
          <Sidebar></Sidebar>
          <Content></Content>
        </FileProvider>
      </LoadingProvider>
    </div>
  );
}

