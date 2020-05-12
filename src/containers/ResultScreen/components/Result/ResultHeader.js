import React, { Component } from 'react'
import { isSpeedKitInstalledCorrectly } from '../../../../helper/resultHelper'
import ResultVideos from './ResultVideos'
import ResultMainMetric from './ResultMainMetric'
import Header from 'components/Header/Header'
import ConfigForm from 'components/ConfigForm/ConfigForm'

class ResultHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showConfig: props.showConfig,
      showAdvancedConfig: props.showAdvancedConfig,
    }
  }

  renderMainMetric() {
    return (
      <ResultMainMetric { ...this.props } />
    )
  }

  renderVideos() {
    return (
      <ResultVideos { ...this.props } />
    )
  }

  renderConfigForm() {
    return (
      <div className="pt5 pb4">
        <ConfigForm
          config={this.props.config}
          showConfig={this.state.showConfig}
          showAdvancedConfig={this.state.showAdvancedConfig}
          showConfigToggle={true}
          onToggleAdvancedConfig={this.props.onToggleAdvancedConfig}
          onSubmit={this.props.onSubmit}
        />
      </div>
    )
  }

  render() {
    const { competitorError, testOverview } = this.props.result
    const { isSpeedKitComparison, speedKitVersion, configAnalysis } = testOverview

    return (
      <div className={"results-header"}>
        <Header changeColorOnResize={false} />
        <div className={"container"}>
          {this.renderConfigForm()}
          {isSpeedKitComparison && (
            <div className="text-center" style={{ padding: '0px 16px' }}>
              <div className="flex justify-center" style={{ alignItems: 'center' }}>
                <h4 className={"mt0"}>{isSpeedKitInstalledCorrectly(configAnalysis) ? (
                  "Thank you for using Speed Kit " + speedKitVersion) : (
                  "Thank you for installing Speed Kit, the configuration is not done yet. Please see below for more information."
                )}</h4>
              </div>
            </div>
          )}
          {this.props.result.isFinished && !competitorError && (
            <div>
              {this.renderMainMetric()}
              {this.renderVideos()}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default ResultHeader
