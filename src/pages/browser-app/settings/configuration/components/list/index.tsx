import React, { FunctionComponent, useEffect, useState } from 'react'
import { bemClass } from '@utils'
import Text from '@base/text'
import Button from '@base/button'

import './style.scss'
import Column from '@base/column'
import SettingPanel from '../setting-panel'
import Row from '@base/row'
import { useLocation } from 'react-router-dom'
import Loader from '@components/loader'
import { useConfigurationsQuery } from '@api/queries/configuration'
import { Configuration, ConfigurationItem } from '@types'

const blk = 'configuration'

interface ConfigurationProps {}

const Configuration: FunctionComponent<ConfigurationProps> = () => {
  const { data: configurationsData, isLoading } = useConfigurationsQuery()
  const location = useLocation()
  const [configuration, setConfiguration] = useState<Array<Configuration>>([])

  useEffect(() => {
    if (configurationsData && configurationsData.data) {
      const configResult: Array<Configuration> = configurationsData.data
      if (configResult.length > 0) {
        configResult.forEach((configuration: Configuration) => {
          configuration.configurationItems.forEach((configurationItem: ConfigurationItem, index) => {
            configurationItem.id = index + 1
          })
        })
        setConfiguration(configResult)
      }
    }
  }, [configurationsData])

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          Configurations
        </Text>
        {/* <Button
          category="primary"
          asLink
          href={`${location.pathname}/create`}
          size="medium"
        >
          New Configuration
        </Button> */}
      </div>
      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <>
            <Loader />
          </>
        ) : (
          <>
            {configuration.length === 0 ? (
              <div className={bemClass([blk, 'empty-config'])}>
                <Text typography="xl">No Configurations</Text>
              </div>
            ) : (
              <>
                <Row>
                  <Column col={6}>
                    {configuration.map((configurationItem: Configuration, index) => {
                      return (
                        <React.Fragment key={configurationItem._id}>
                          {(index === 0 || index % 2 === 0) && (
                            <SettingPanel
                              configId={configurationItem._id}
                              key={configurationItem._id}
                              title={configurationItem.name}
                              className={bemClass([blk, 'config-panel'])}
                              config={configurationItem.configurationItems}
                            />
                          )}
                        </React.Fragment>
                      )
                    })}
                  </Column>
                  <Column col={6}>
                    {configuration.map((configurationItem: Configuration, index) => {
                      return (
                        <>
                          {index !== 0 && index % 2 !== 0 && (
                            <SettingPanel
                              configId={configurationItem._id}
                              key={configurationItem._id}
                              title={configurationItem.name}
                              className={bemClass([blk, 'config-panel'])}
                              config={configurationItem.configurationItems}
                            />
                          )}
                        </>
                      )
                    })}
                  </Column>
                </Row>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Configuration
