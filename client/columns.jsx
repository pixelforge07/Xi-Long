import OnPageColumns from "./on-page-columns";

function Columns(){
    const editableColumns = ([
        {field: "stock", onField: true, hide:false, label: "Enter Stock", type: "number", editable: true, cellClass: "fade-in-col"},
        {field: "rate", onField: true, hide:false, label: "Enter Rate", type: "number", editable: true, cellClass: "fade-in-col"},
        {field: "discount", onField: true, hide:false, label: "Enter Discount", type: "number", editable: true, cellClass: "fade-in-col"},
    ])

    return(
        <OnPageColumns columns={editableColumns} />
    )
}

export default Columns;