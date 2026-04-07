import {useState, useEffect} from 'react';
import AgGrid from './ag-grid';


function OnPageColumns({columns}){
    const [columnDefs, setColumnDef] = useState([
        {field: 'id', onField: true, hide: false, editable: false, label: 'Id'},
        {field: 'name', onField: true, hide: false, editable:true, label: 'Enter-Name'},
        {field: 'price', onField: true, hide: false, editable:true, label: 'Enter-Price'},
        {field: 'quantity', onField: true, hide: false, editable:true, label: 'Enter-Quantity'},
        {field: 'total', onField: true, hide: false, editable:true, label: 'Total'}
    ])
    const [functionRun, setFunctionRun] = useState([false])
    const [row, setRow] = useState([]);

    if(row.length === 0){
        setRow([{id:1}])
    }
     const gettingData = async () => {


        try {
            const res = await fetch("http://localhost:5580/onFieldcolumns");
            const data = await res.json();
            const newColumns = data.map(col => col.config);
            console.log(newColumns)
            //setting addcolumns
            if(newColumns.length !== 0){
                console.log(' length is not zero')
                setColumnDef(prev => [
                    ...prev, ...newColumns.filter(newCol => 
                        !prev.some(col => col.field === newCol.field)
                    )
                ]);      
            }

            console.log(columnDefs)
        }catch(err){
            console.log(`error in fetching data from : ${err} `)
        }
        setFunctionRun(true)
    }

    useEffect(() => {
        gettingData();
    }, [])

    const [showPopup, setShowPopup] = useState(false)

    const addItem = async(col) => {
        console.log(col)
        const toFound = columnDefs.some(item => item.field === col.field)
        
         // console.log(toFound)
        if(toFound ) return
        setColumnDef(
            prev => [
                    ...prev, col
                ]
        )

        try{
            await fetch('http://localhost:5580/onFieldcolumns', {
                    method: "POST",
                    headers: {   
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                    config: col,
                }),
        
            })
        }catch(err){
            console.log(`Error in adding on field columns: ${err}`)
        }
        setShowPopup(false);
    }

    const addNewRow = () => {

        const checkRow = row.some(col => {
            const {id, ...rest} = col;
            return Object.values(rest).length === 0
        });
            
        const id = Number(row.length) + 1
        if(checkRow === false){
            setRow(
                prev => [
                        ...prev, {id: id}
                    ]
            )}
            console.log(row)
        };


    const onCellValueChange = ({data, node}) => {
        setRow(prev => {
            const updatedRow = [...prev]
            updatedRow[node.rowIndex] = data;
            return updatedRow;
        })
    }
    return(
        <div>
                
        <button onClick={() => setShowPopup(true)}>+ Columns</button>

        {showPopup && (
            <div>
                {columns.map((item) => (
                    <p onClick={() => addItem(item)}
                    key={item.field} 
                    >
                        {item.field}
                    </p>
                ))}
            </div>
        )}

        <button onClick={() => addNewRow()}>+Row</button>

        <AgGrid 
        columnData={columnDefs}
        rowData={row}
        onCellValueChange={onCellValueChange}
        />
        </div>
    )
}

export default OnPageColumns;