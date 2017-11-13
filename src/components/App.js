require('styles/vender/bootstrap.min.css');
require('styles/vender/font-awesome.min.css');
require('styles/vender/Raleway.css');
require('styles/App.css');
require('es6-promise').polyfill();
require('isomorphic-fetch');

import React from 'react'

class AppComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    var that = this;
      fetch('/api/data')
      .then((resp) => {
          return resp.json();
      }).then((json) => {
        that.setState({ cwnNumber: json.cwnNumber, users: json.users });
        console.log(json);
      });
  }

  render() {
    if (this.state)
      return (<div></div>);
    return (
      <div>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
