import React, { FunctionComponent } from 'react'
import './style.scss'
import { bemClass } from '@utils'
import Row from '@base/row'
import Column from '@base/column'
import Button from '@base/button'
import Spinner from '@base/spinner'

const blk = 'loader'

interface LoaderProps {
  type?: 'form'
}

const Loader: FunctionComponent<LoaderProps> = ({ type }) => {
  if (type === 'form') {
    return (
      <>
        <div className={bemClass([blk, 'form'])}>
          <div className={bemClass([blk, 'form-title'])} />
          <div className={bemClass([blk, 'form-content'])}>
            <Row className={bemClass([blk, 'form-row'])}>
              <Column col={4}>
                <div className={bemClass([blk, 'form-field'])} />
              </Column>
              <Column col={4}>
                <div className={bemClass([blk, 'form-field'])} />
              </Column>
              <Column col={4}>
                <div className={bemClass([blk, 'form-field'])} />
              </Column>
            </Row>
            <Row className={bemClass([blk, 'form-row'])}>
              <Column col={4}>
                <div className={bemClass([blk, 'form-field'])} />
              </Column>
              <Column col={4}>
                <div className={bemClass([blk, 'form-field'])} />
              </Column>
              <Column col={4}>
                <div className={bemClass([blk, 'form-field'])} />
              </Column>
            </Row>
            <Row className={bemClass([blk, 'form-row'])}>
              <Column col={4}>
                <div className={bemClass([blk, 'form-field'])} />
              </Column>
              <Column col={4}>
                <div className={bemClass([blk, 'form-field'])} />
              </Column>
            </Row>
          </div>
        </div>
        <div className={bemClass([blk, 'form-action-items'])}>
          <Button
            className={bemClass([blk, 'form-action-button', { first: true }])}
            size="medium"
            category="default-outline"
          >
            {'   '}
          </Button>
          <Button
            className={bemClass([blk, 'form-action-button'])}
            size="medium"
            category="default"
          >
            {'   '}
          </Button>
        </div>
      </>
    )
  } else {
    return <Spinner />
  }
}

export default Loader
