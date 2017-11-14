require('styles/App.css');
require('es6-promise').polyfill();
require('isomorphic-fetch');
import Autosuggest from 'react-autosuggest';

import React from 'react'

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(value, users) {
  const escapedValue = escapeRegexCharacters(value.trim());
  
  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp('^' + escapedValue, 'i');

  return users.filter(user =>
    {
    return regex.test(user.email) || regex.test(user.name);
    });
}

function getSuggestionValue(suggestion) {
  return suggestion.email;
}

function renderSuggestion(suggestion) {
  return (
    <div>
      <span>{suggestion.name}</span>
      <br />
      <span>{suggestion.email}</span>
    </div>
  );
}

class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      cwnNumber: -1,
      users: [],
      value: '',
      suggestions: []
    }
  }

  onChange = (event, { newValue, method }) => {
    this.setState({
      value: newValue
    });
  };
  
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value, this.state.users)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  handleClick = () => {
    console.log('checkin');
    //TODO: actually checkin.

    //I'm thinking here the best way will to use some sort of component and fire off the request right here. Then I can get the response and show it directly through toastr
  }

  componentWillMount() {
    var that = this;
      fetch('/api/data')
      .then((resp) => {
          return resp.json();
      }).then((json) => {
        that.setState({ cwnNumber: json.cwnNumber, users: json.users, loading: false });
      }).catch((reason) => {
        that.setState({ cwnNumber: -1, users: [], loading: true });
      });
  }

  render() {
    if (this.state.loading)
      return (<div></div>);

    const value = this.state.value;
    const suggestions = this.state.suggestions;
    const inputProps = {
      placeholder: 'Enter your Name or Email',
      value,
      onChange: this.onChange
    };
  
    return (
      <div>
        <h1>CoWorking Night</h1>
        <h1>Please sign in</h1>
        <h4>Enter you name or email address</h4>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps} />
          <button onClick={this.handleClick}>SignIn</button>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
