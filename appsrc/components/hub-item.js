
import React, {Component, PropTypes} from 'react'

export class HubItem extends Component {
  render () {
    return <div className='hub_item'>
      <section className='cover' style={{backgroundImage: `url("https://downloads.2kgames.com/xcom2/blog_images/Bx987a1Y_uto0o471x_date.jpg")`}}/>

      <section className='actions'>
        <div className='button'>
          <span className='icon icon-checkmark'/>
          <span>Launch</span>
        </div>
      </section>
    </div>
  }
}

HubItem.propTypes = {}

export default HubItem