import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = (state) => state;
const mapDispatchToProps = {};

export class {Name} extends React.Component {

  render() {
    return <div>Welcome to {Name}!</div>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)({Name});