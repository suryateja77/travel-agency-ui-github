import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import Configuration from './components/list'
import CreateConfiguration from './components/create-configuration'

interface ConfigurationsProps {}

const Configurations: FunctionComponent<ConfigurationsProps> = ({}) => {
  return (
    <Routes>
      <Route
        path={``}
        Component={Configuration}
      />
      <Route
        path={`create`}
        Component={CreateConfiguration}
      />
    </Routes>
  )
}

export default Configurations
