import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

function AgGrid({rowData, columnData, onCellValueChange}){
    return(
        <div style={{ height: 500, width: '100%' }}>
            <AgGridReact 
                rowData={rowData} 
                columnDefs={columnData}
                defaultColDef={{
                    editable: true,
                }} 
                onCellValueChanged={onCellValueChange}
            />
        </div>
    )
}

export default AgGrid;