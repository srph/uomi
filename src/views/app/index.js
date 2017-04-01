import React, {cloneElement} from 'react';
import {ipcRenderer as ipc} from 'electron';
import Helmet from 'react-helmet';
import {Link} from 'react-router';
import history from 'app/history';
import numeral from 'numeral'

export default class AppView extends React.Component {
  state = {
    debtors: [],
    resolved: false
  }

  componentDidMount() {
    ipc.once('debtors:get', (event, debtors) => {
      this.setState({ debtors, resolved: true })
    })

    ipc.send('debtors:get')
  }

  render() {
    if (!this.state.resolved) {
      return <div />
    }

    return (
      <div>
        <div className="main-layout">
          <aside className="menu">
            <div className="pane-heading">
              <button className="action">
                <i className="fa fa-cog" />
              </button>

              <h4 className="title">
                Uomi
              </h4>

              <Link to="/d/create" className="action">
                <i className="fa fa-plus" />
              </Link>
            </div>

            <form>
              <div className="pane-search">
                <input type="text" className="input" placeholder="Search by name" />
                <button className="submit">
                  <i className="fa fa-search" />
                </button>
              </div>
            </form>

            <div className="main-pane">
              {this.state.debtors.map((debtor, i) =>
                <Link to={`/d/${debtor.id}`} className="pane-item" activeClassName="-active" key={i}>
                  <div className="info">
                    <h4 className="title">{debtor.name}</h4>
                    <h6 className="subtitle">
                      {debtor.remaining === 0
                        ? <span><i className="fa fa-check" /> Paid Up!</span>
                        : <span>{numeral(debtor.remaining).format('0,0')} to go</span>}
                    </h6>
                  </div>
                </Link>
              )}
            </div>
          </aside>

          <div className="content">
            {cloneElement(this.props.children, {
              debtors: this.state.debtors,
              onCreateDebtor: this.handleCreateDebtor
            })}
          </div>
        </div>
      </div>
    );
  }

  handleCreateDebtor = (data) => {
    this.setState({
      debtors: [data, ...this.state.debtors]
    })

    history.push(`/d/${data.id}`)
  }
}
