import React, { Component } from 'react';
import 'react-beautiful-dnd';
import './App.css';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';

class App extends Component {


    render() {
        var displaySize = Math.min(20,window.FieldSorter.incomingFields.length);

        return (
            <div className="App">
                <div>Unsorted fields</div>
                <div>
                    <select className="UnmatchedFields" multiple="multiple" size={displaySize}>
                        {window.FieldSorter.incomingFields.map(item => {
                            return <option key={item.strName}>{item.strName}</option>;
                        })}
                    </select>
                </div>
                <div>
                    <button className="AddButton" type="button" onClick={()=>console.log('Click!')}>Add</button>
                </div>
                <div className="SortedFields">
                    <Table>
                        <TableBody>
                            {window.FieldSorter.sortedFields.map((sortField, index) => {
                            return <SortRow key={index} sortField={sortField} />
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }
}

class SortRow extends Component {
    constructor(props) {
        super(props);
        this.isPatternChanged = this.isPatternChanged.bind(this);
        this.textChanged = this.textChanged.bind(this);
    }

    isPatternChanged() {
        this.props.sortField.isPattern = !this.props.sortField.isPattern;
        this.forceUpdate();
    }

    textChanged(event) {
        this.props.sortField.text = event.target.value;
        this.forceUpdate();
    }

    render(){
        return <TableRow style={{height: 20}}>
            <TableCell component="th" scope="row">
                <TextField fullWidth={true} type="text" value={this.props.sortField.text} onChange={this.textChanged} />
            </TableCell>
            <TableCell>
                <Checkbox checked={this.props.sortField.isPattern} onChange={this.isPatternChanged} />
            </TableCell>
        </TableRow>;
    }
}

export default App;