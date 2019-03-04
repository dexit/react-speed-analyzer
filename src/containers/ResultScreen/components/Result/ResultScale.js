import React, {Component} from 'react'

const Marker = ({style}) => (
  <svg
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="-5 -5 56 64"
    width="47"
    height="54"
    aria-labelledby="Label__score-marker"
    style={style}>
    <title id="Label__score-marker">
      Graph label for speed score
    </title>
    <defs>
      <filter id="marker-dropshadow" x="-10%" y="-10%">
        <feGaussianBlur in="SourceAlpha" result="blur-out" stdDeviation="2"></feGaussianBlur>
        <feOffset in="blur-out" result="the-shadow" dx="0" dy="0"></feOffset>
        <feColorMatrix
          in="the-shadow"
          result="color-out"
          type="matrix"
          values="0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 0 .25 0">
        </feColorMatrix>
        <feBlend in="SourceGraphic" in2="color-out" mode="normal"></feBlend>
      </filter>
    </defs>
    <g filter="url(#marker-dropshadow)">
      <path id="path-1_9_"
            d="M23.2,0c12.9,0,23.2,10.2,23.2,22.9c0,6.4-3.6,13.2-13,22.4L23.2,55.4L12.9,45.3 C3.6,36,0,29.2,0,22.9C0,10.2,10.4,0,23.2,0L23.2,0z"
            style={{fill: 'white'}}></path>
    </g>
  </svg>
)

const Bobbel = ({description, time, style, upsideDown, absolute, mobile, order, delta, offset}) => (
  <div
    className={`flex justify-center items-center ${absolute ? 'absolute' : ''}`}
    style={style}>
    <div
      className={`relative flex justify-center ${mobile ? '' : 'flex-column'} ${order && delta < 250 ? ((order === 2 && 'items-end') || 'items-start') : 'items-center'}`}>
      <div style={{
        right: (mobile && offset < 55) ? 54 : -110,
        top: upsideDown ? 14 : 8,
        whiteSpace: 'nowrap',
        position: mobile ? 'absolute' : 'initial',
        order: mobile ? 1 : 0
      }}>
        <small style={{fontWeight: 600, fontSize: 12}}>{description}</small>
      </div>
      <span style={{
        position: 'absolute',
        display: 'block',
        width: delta < 250 ? 47 : '100%',
        textAlign: 'center',
        top: mobile ? ((upsideDown && 19) || 13) : 38,
        right: order === 2 && delta < 250 ? 0 : 'auto',
        left: order === 1 && delta < 250 ? 0 : 'auto',
        fontWeight: 400,
        fontSize: 14,
        zIndex: 1
      }}>
        {time}
      </span>
      <Marker style={{transform: upsideDown ? 'rotate(180deg)' : null}}/>
    </div>
  </div>
)

const round = (time) => {
  return Math.round(time / 100) / 10
}

/**
 * Calculates the representing percentage share of the fastest result.
 *
 * @param {number} time
 * @returns {number} Calculated percentage share is between 0 and 0.8 of the fastest result.
 */
const calculatePercentageForFirstBobble = (time) => {
  if (time === 0.1) {
    return 0
  } else if (time > 5) {
    return 0.8
  }

  return 8 / 49 * time - 4 / 245
}

/**
 * Calculates the representing percentage share of the slowest result.
 *
 *
 * @param {number} firstTime
 * @param {number} secondTime
 * @returns {number} Calculated percentage share is between 0 and 0.8 of the slowest result.
 */
const calculatePercentageForSecondBobble = (firstTime, secondTime) => {
  const timeDifference = secondTime - firstTime
  if (timeDifference === 0) {
    return calculatePercentageForFirstBobble(firstTime) + 0.01
  } else if (timeDifference === 0.1) {
    // adds percentage from the first bobble
    return calculatePercentageForFirstBobble(firstTime) + 0.15
  } else if (secondTime >= 5) {
    return 0.8
  }

  return calculatePercentageForFirstBobble(firstTime) + 13 / 96 * timeDifference + 131 / 960
}

const getDescriptionForFirstBobble = (speedKitTime, competitorTime, hasSpeedKitInstalled) => {
  if (speedKitTime < competitorTime && !hasSpeedKitInstalled) {
    return 'With Speed Kit'
  } else if (speedKitTime >= competitorTime && hasSpeedKitInstalled) {
    return 'Without Speed Kit'
  }

  return 'Your Website'
}

const getDescriptionForSecondBobble = (speedKitTime, competitorTime, hasSpeedKitInstalled) => {
  if (speedKitTime < competitorTime && hasSpeedKitInstalled) {
    return 'Without Speed Kit'
  } else if (speedKitTime >= competitorTime && !hasSpeedKitInstalled) {
    return 'With Speed Kit'
  }

  return 'Your Website'
}

class ResultScaleComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      windowWidth: null,
      width: null
    }
    this.scalaContainerWidth = null
  }

  updateWidths = () => {
    const windowWidth = window.innerWidth
    const width = this.scalaContainer && this.scalaContainer.getBoundingClientRect().width
    if (width && (width !== this.state.width)) {
      this.setState({windowWidth, width})
    } else {
      this.setState({windowWidth})
    }
  }

  componentWillMount = () => {
    this.updateWidths()
  }

  componentDidMount = () => {
    window.addEventListener("resize", this.updateWidths)
  }

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.updateWidths)
  }

  render() {
    const {speedKitError, competitorTest, speedKitTest, mainMetric, testOverview} = this.props.result
    //round times
    const competitorTimeRounded = competitorTest.firstView && competitorTest.firstView[mainMetric] && round(competitorTest.firstView[mainMetric])
    const speedKitTimeRounded = speedKitTest.firstView && !speedKitError && speedKitTest.firstView[mainMetric] && round(speedKitTest.firstView[mainMetric])

    //give order
    const competitorOrder = competitorTimeRounded >= speedKitTimeRounded ? 2 : 1
    const speedKitOrder = speedKitTimeRounded > competitorTimeRounded ? 2 : 1
    const firstTime = competitorOrder > speedKitOrder ? speedKitTimeRounded : competitorTimeRounded
    const secondTime = speedKitOrder > competitorOrder ? speedKitTimeRounded : competitorTimeRounded

    //calculate percentage to px depending on width + 3. calculate percentage of scale
    const firstBobblePercentage = calculatePercentageForFirstBobble(firstTime)
    const secondBobblePercentage = calculatePercentageForSecondBobble(firstTime, secondTime)

    const hasSpeedKitInstalled = testOverview.isSpeedKitComparison
    const timeDelta = secondTime - firstTime

    return (
      <div ref={(container) => {
        if (!this.scalaContainer) {
          this.scalaContainer = container
          this.updateWidths()
        }
      }}>
        <div className={`relative pt4 pt5-ns mt1 ${(speedKitTimeRounded && 'pb4 mb1 pb3-ns mb0-ns') || 'pb1'}`}>
          {secondTime && this.state.windowWidth < 480 && (
            <Bobbel
              description={getDescriptionForSecondBobble(speedKitTimeRounded, competitorTimeRounded, hasSpeedKitInstalled)}
              time={`${secondTime}s`}
              style={{right: `${secondBobblePercentage * 100}%`, top: -8, marginLeft: -22.5}}
              offset={secondBobblePercentage * 100}
              absolute
              mobile
            />
          )}
          {firstTime && this.state.windowWidth < 480 && (
            <Bobbel
              description={getDescriptionForSecondBobble(speedKitTimeRounded, competitorTimeRounded, hasSpeedKitInstalled)}
              time={`${firstTime}s`}
              style={{right: `${firstBobblePercentage * 100}%`, top: 64, marginLeft: -22.5}}
              offset={firstBobblePercentage * 100}
              absolute
              mobile
              upsideDown
            />
          )}
          <div className="flex" style={{
            fontWeight: 400,
            background: 'linear-gradient(to left, rgb(200, 228, 176), rgb(255, 251, 199), rgb(255, 221, 221))'
          }}>
            <div className="w-50 pa1 red border-left">Average</div>
            <div className="w-50 pa1 dark-green border-right tr">Fast</div>
          </div>
          <div className="flex absolute" style={{top: 0, width: '100%', flexDirection: 'row-reverse'}}>
            {secondTime && this.state.windowWidth >= 480 && this.state.width && (
              <Bobbel
                description={getDescriptionForSecondBobble(speedKitTimeRounded, competitorTimeRounded, hasSpeedKitInstalled)}
                time={`${secondTime}s`}
                order={2}
                delta={timeDelta}
                style={{
                  marginTop: -8,
                  order: 2,
                  marginRight: `${secondBobblePercentage * 100 - firstBobblePercentage * 100}%`
                }}
              />
            )}
            {firstTime && this.state.windowWidth >= 480 && this.state.width && (
              <Bobbel
                description={getDescriptionForFirstBobble(speedKitTimeRounded, competitorTimeRounded, hasSpeedKitInstalled)}
                time={`${firstTime}s`}
                order={1}
                delta={timeDelta}
                style={{
                  marginTop: -8,
                  order: 1,
                  marginRight: `${firstBobblePercentage * 100}%`
                }}
              />
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default ResultScaleComponent
