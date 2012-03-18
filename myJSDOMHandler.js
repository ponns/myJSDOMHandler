$.fn.getRowIndex = function() {
    if (!$(this).is('td') && !$(this).is('th')) return -1;
    return $(this).closest('tr').parent().children().index($(this).parent());
};

$.fn.getColumnIndex = function() {
    if (!$(this).is('td') && !$(this).is('th')) return -1;

    var allCells = this.closest('tr').children();
    var normalIndex = allCells.index(this);
    var nonColSpanIndex = 0;

    allCells.each(

    function(i, item) {
        if (i == normalIndex) return false;

        var colspan = $(this).attr('colspan');
        colspan = colspan ? parseInt(colspan) : 1;
        nonColSpanIndex += colspan;
    });

    return nonColSpanIndex;
};

jQuery.fn.extend({
    getJQSelector: function( path ) {
        // The first time this function is called, path won't be defined.
        if ( typeof path == 'undefined' ) path = '';

        // If this element is <html> we've reached the end of the path.
        if ( this.is('html') ) return 'html' + path;

        // Add the element name.
        var cur = this.get(0).nodeName.toLowerCase();
        var tagname = cur;
        
        // Determine the IDs and path.
        var id    = this.attr('id'), classx = this.attr('class');
  
        if (( typeof id != 'undefined' )&&(id != "")){
        	// Add the #id if there is one.
            cur += '#' + id;
        }else if (( typeof classx != 'undefined' )&&(classx != "")){
            // Add any classes.
            cur += '.' + classx.split(/[\s\n]+/).join('.');
        }else {
			// Add index
            var currentIndex = this.parent().children(tagname).index(this.get(0));
            cur += ':eq('+ currentIndex +')' ;
        } 
        
        return this.parent().getJQSelector( ' > ' + cur + path );
    }
});

function Cell(cellelem) {
    this.elem = cellelem ;  
    var localCell = $(cellelem);

    this.ColumnIndex = localCell.getColumnIndex();
    this.RowIndex = localCell.getRowIndex();

    var localColSpan = localCell.attr('colspan');
    this.ColumnSpan = localColSpan ? parseInt(localColSpan) : 1;

    var localRowSpan = localCell.attr('rowspan');
    this.RowSpan = localRowSpan ? parseInt(localRowSpan) : 1;

    this.setRowSpan = function(value){
    	    localCell.attr('rowspan', value);
    };
    
    this.setColSpan = function(value){
    	    localCell.attr('colspan', value);
    }; 
    
    this.after = function(obj){
    	    localCell.after(obj);
    };
    this.before = function(obj){
    	    localCell.before(obj);
    }; 
    this.empty = function(){
    	localCell.empty();    
    };
    this.isEmpty = function(){
    	    return (localCell.html().trim().length == 0)
    };
    this.splitCell = function(type){ 
    	    if (this.isEmpty()){ 
		    var localHTMLStr = "<table style='border:1px solid #ccffcc;width:"+ localCell.width() +"; height:"+ localCell.height()+ ";'>";
		    if (type == "V"){
		    	    localHTMLStr += "<tr> <td> <img src='images/pixel.gif'> </td></tr>" ;
		    	    localHTMLStr += "<tr> <td> <img src='images/pixel.gif'> </td></tr>" ;
		    }else{
		    	    localHTMLStr += "<tr> <td> <img src='images/pixel.gif'> </td> <td> <img src='images/pixel.gif'> </td> </tr>" ;
		    } 
		    localHTMLStr +=     "</table>" ;
		    localCell.html(localHTMLStr );
	    } 
    } 
    
    //log.debug("Cell: [ColumnIndex: " + this.ColumnIndex + "][RowIndex: " + this.RowIndex + "][ColumnSpan: " + this.ColumnSpan + "][RowSpan: " + this.RowSpan + "]");

}

function Table(tableElem){
    var tbl = $(tableElem);
    this.elem = tableElem ;
    this.ColumnCount = 0 ;
    this.RowCount = 0;
    
    var metaDataTable = [];
    
    this.getAllRows = function(){
    	    return tbl.children('tbody').children('tr');
    };
    
    this.fnColumnCount = function(){
        var allCells = $(tbl.children('tbody').children('tr')[0]).children('td,th');
        var rowcount = 0;
        allCells.each(
            function(i, item) {  
            var colspan = $(this).attr('colspan');
            colspan = colspan ? parseInt(colspan) : 1;
            rowcount += colspan;
            }
       );
       return rowcount;
    };
    
    this.fnRowCount = function(){
            var allrows = this.getAllRows();
            return allrows.length;
    }; 
    
    this.getRow = function(index){
            var allrows = this.getAllRows();
            if ((index < 0 ) || ( (index-1) > allrows.length) ) return null;
            return allrows.get(index);
    }; 
    
    this.getLastRow = function(){
            var allrows = this.getAllRows();
            return allrows.get(allrows.length-1);
    };    
    
    this.analyze = function(){ 
    	    log.debug("is analyzing");
    	    var allrows = this.getAllRows();
    	    
    	    for(var i=0; i < allrows.length ;i++){
    	    	    var metaDataRow = [];
    	    	    metaDataTable[metaDataTable.length] = metaDataRow ;
    	    }
    	    
    	    allrows.each(function(rowIndex){ 
		     $(this).children('td,th').each(function(cellIndex){
		     	
				   $(this).click(function(event){ 
						handleClickableElementSelection(this, event);
				   }); 
		     		
			       var localCurrentCell = new Cell(this);
			       if ((localCurrentCell.RowSpan > 1)){   
				       for(var j=1; j < localCurrentCell.RowSpan ;j++){
					       metaDataTable[rowIndex+j][cellIndex] = "X#R" + localCurrentCell.RowSpan + ",C"+ localCurrentCell.ColumnSpan;
				       } 
			       }  
			       /*if ((localCurrentCell.ColumnSpan > 1)){   
				       for(var j=1; j < localCurrentCell.ColumnSpan ;j++){
				       	       var k = 0 ;
				       	       while (metaDataTable[rowIndex][cellIndex+j+k] == 0){
				       	       	       k++;
				       	       } 
				       	       metaDataTable[rowIndex][cellIndex+j+k] = "C0" ;
				       }                                                             
			       } */ 
		     });  
    	    }); 
    	    log.debug("Analysis completed...");
    };
    
	this.isCellVoid = function(row,col){   
		/*for(var j=0; j < metaDataTable.length ;j++)  { 
			var str = "" ;
			for(var k=0; k < metaDataTable[j].length ;k++)  {
				str += metaDataTable[j][k] + " ";
			}   
			log.debug(str);           
		 } */
		 return metaDataTable[row][col] ;
	};
	
	this.checkCellVoid = function(row,col){ 
		try {
			var lstr = this.isCellVoid(row,col) ;
			return (lstr.indexOf("X#") != -1) ;
		 } catch (err) {}
    	    
		 return false ;
	};
	
	this.getVoidCauseingRowIndex = function(row,col){
		row--;
		while( this.checkCellVoid(row,col) ){
			row--
		} 
		return row-- ;
	}; 
	
    this.analyze();
    if (this.ColumnCount == 0)  this.ColumnCount = this.fnColumnCount();
    if (this.RowCount == 0)  this.RowCount = this.fnRowCount();
    	     
    //log.debug("Table: [ColumnCount: "+ this.ColumnCount +"][RowCount: "+this.RowCount+"] ");
}

function MyTableHandler(cell) {
    //cell is a jquery object
    this.cell = cell;
    //JS Cell Elem
    this.jscell = cell.get(0);
    this.action = "";
    this.type = "";
    this.direction = "";

    this.TYPE = {
        ROW: 0,
        COLUMN: 1,
        CELL: 2
    };
    this.ACTION = {
        ADD: 0,
        DELETE: 1,
        MERGE: 2
    };
    this.DIRECTION = {
        ABOVE: 0,
        BELOW: 1,
        LEFT: 2,
        RIGHT: 3
    };

    this.highlight = function() {
        var ltmp = this.cell.css("border");
        //log.debug("ltmp 1 is " + ltmp);
        if ((typeof ltmp === "undefined") || (ltmp.indexOf("1px") == -1)) {
            ltmp = "1px solid #8F24B2";
        } else {
            ltmp = "0px";
        }
        //log.debug("ltmp is " + ltmp);
        this.cell.css("border", ltmp);
        //log.debug("TD is highlighted");
    };

    var tbl = this.cell.closest('table');
    var table = new Table(tbl.get(0));
       
    this.exec = function(){
    	var localXColIndex = this.cell.getColumnIndex();
    	var localXRowIndex = this.cell.getRowIndex();
    	log.debug("localXColIndex" + localXColIndex);
    	log.debug("localXRowIndex" + localXRowIndex);
    	 
    	if (this.ACTION[this.action] == 0){ //Insert 
    		if(this.TYPE[this.type] == 0 ){ //ROw 
    			if( this.DIRECTION[this.direction] == 0 ){//above
    				this.insertRow(localXRowIndex);
    			}   
    			if( this.DIRECTION[this.direction] == 1 ){//below
    				this.insertRow(localXRowIndex+1);
    			}  
    		}else if(this.TYPE[this.type] == 1 ){ //column 
    			if( this.DIRECTION[this.direction] == 2 ){//left
    				this.insertColumn(localXColIndex);
    			}   
    			if( this.DIRECTION[this.direction] == 3 ){//right
    				this.insertColumn(localXColIndex+1);
    			}  
    		} 
    	}else if (this.ACTION[this.action] == 1){ //DELETE  
    		if(this.TYPE[this.type] == 0 ){ //ROw
    			this.deleteRow(localXRowIndex) ;
    		}else if(this.TYPE[this.type] == 1 ){ //column
    			this.deleteColumn(localXColIndex) ;
    		} 
    	}
    }   
       
    this.insertRow = function(atRowIndex) {
       log.debug("fn.insertRow: " + atRowIndex);
 
       //initialize the array
       var columnsHTMLStrArray = [];
       for(var i=0 ; i < table.ColumnCount ; i++){
                  columnsHTMLStrArray[columnsHTMLStrArray.length] = "<td style='background-color:#000000'></td>";
       }
       log.debug("Array length: " + columnsHTMLStrArray.length);
       
       //process the array - remove the column if it intrudes the spanned column
       table.getAllRows().each(function(){ 
	       var localCurrentRow = $(this);
	       localCurrentRow.children('td,th').each(function(){
		       var localCurrentCell = new Cell(this);
		       if (localCurrentCell.RowSpan > 1){ 
			       if ((localCurrentCell.RowIndex < atRowIndex) && (atRowIndex <= (localCurrentCell.RowIndex+localCurrentCell.RowSpan-1))){
			       	       for(var i=0; i < localCurrentCell.ColumnSpan;i++){
			       	       	       columnsHTMLStrArray[localCurrentCell.ColumnIndex+i] = "" ; 
			       	       } 
			       	       localCurrentCell.setRowSpan(localCurrentCell.RowSpan+1);
			       }
		       }
	       }); 
       }); 
       
       //form the html string
       var localStrHTML = "<tr height='10px'>";
       for (var i = 0; i <= columnsHTMLStrArray.length; i++) {
                  localStrHTML += columnsHTMLStrArray[i];
       }
       localStrHTML += "</tr>";
       
       //appeend the row
       var currentRow = table.getRow(atRowIndex) ;
       if (currentRow == null){
                  $(table.getLastRow()).after(localStrHTML);
       }else{
                  $(currentRow).before(localStrHTML);
       }
       table.analyze();
       log.debug("insert row completed...");
    };
    
    this.insertColumn = function(atColumnIndex){
    	    log.debug("fn.insertColumn: " + atColumnIndex);
    	    
    	    var localHTMLStr = "<td width='10px' style='background-color:#000000'></td>";
    	    
    	    //process each cell
    	    var totalColumnCount = table.ColumnCount ;
    	    var totalRowCount = table.RowCount ;
    	    
    	    var i = -1;
    	    var j = -1 ;
    	    
    	    table.getAllRows().each(function(){ 
    	       i++; j=-1;
    	       var adjustColumns = 0 ;
	       $(this).children('td,th').each(function(){
	       	       j++; 
	       	       var newAdjust = 0 ;
		       try{ 
		       	       var lstr = table.isCellVoid(i,j) ;  
			       if (lstr.indexOf("X#") != -1 ) { 
				       lstr = lstr.substring(lstr.indexOf("C")+1);
				       newAdjust = parseInt(lstr) ; 
			       } 
			       adjustColumns = adjustColumns + newAdjust;
			       j = j + newAdjust ;
	       	       }catch(err){}   
	       	       
	       	       log.debug("Adjust Columns: " + adjustColumns);
		       var localCurrentCell = new Cell(this);
		       
		       var isFirstColumn = ((atColumnIndex == 0)&& ((localCurrentCell.ColumnIndex + adjustColumns) == 0));
		       var isLastColumn = false; 
		       if (! isFirstColumn){ 
		       	       //log.debug("localCurrentCell.ColumnIndex: " + localCurrentCell.ColumnIndex);
		       	       //log.debug("adjustColumns: " + adjustColumns);
		       	       //log.debug("localCurrentCell.ColumnSpan: "+ localCurrentCell.ColumnSpan);
		       	       //log.debug("totalColumnCount: " + totalColumnCount);
		       	       //log.debug("(((localCurrentCell.ColumnIndex + adjustColumns)+localCurrentCell.ColumnSpan-1+1) == totalColumnCount): " + (((localCurrentCell.ColumnIndex + adjustColumns)+localCurrentCell.ColumnSpan-1+1) == totalColumnCount));
		       	       //log.debug("(atColumnIndex > totalColumnCount): " + (atColumnIndex > totalColumnCount));
		       	       isLastColumn =((((localCurrentCell.ColumnIndex + adjustColumns)+localCurrentCell.ColumnSpan-1+1) == totalColumnCount)&&(atColumnIndex > totalColumnCount)) ;
		       }
		       
		       //first column
		       if (isFirstColumn){
		       	       localCurrentCell.before(localHTMLStr);
		       	       log.debug("first column: inserted cell at 0");
		       }
		       //last column
		       if (isLastColumn){
		       	       localCurrentCell.after(localHTMLStr);
		       	       log.debug("last column: inserted cell at the end" );
		       }
		       //in between
		       if ((! isFirstColumn) && (! isLastColumn)){
			       if (atColumnIndex == ((localCurrentCell.ColumnIndex + adjustColumns)+localCurrentCell.ColumnSpan-1+1)){ 
				     localCurrentCell.after(localHTMLStr); 
				     log.debug("middle column: inserted cell x" ); 
			       }else{
			       	       if ( (j == atColumnIndex) && (adjustColumns > 0) && (newAdjust > 0)){
			       	       	       localCurrentCell.before(localHTMLStr); 
			       	       	       log.debug("middle column: inserted cell y" );
			       	       }
			       }
			       if ((atColumnIndex <= ((localCurrentCell.ColumnIndex + adjustColumns)+localCurrentCell.ColumnSpan-1))&&( atColumnIndex > (localCurrentCell.ColumnIndex + adjustColumns))){ 
				     localCurrentCell.setColSpan(localCurrentCell.ColumnSpan+1); 
				     log.debug("middle column: inserted cell - colspan processing " );
			       }  
			       
		       } 
	       }); 
	    }); 
    	    table.analyze();
    	    log.debug("InsertColumn completed..."); 
    };
    
    this.deleteRow = function(rowIndex){
    	   log.debug("fn.deleteRow: " + rowIndex);
    	      
    	    var i = -1;
    	    var j = -1 ;
    	    
    	    var allrows = table.getAllRows();
    	    allrows.each(function(){ 
    	       i++; j=-1;
    	       if (i != rowIndex) return;
    	        
	       $(this).children('td,th').each(function(){ 
	       	      $(this).html("");
	       	      $(this).css('height','0px');
	       });  
	       
	    }); 
	   
	   table.analyze();
	   log.debug("Row Delete completed...");
    };

    this.deleteColumn = function(columnIndex){
    	    log.debug("fn.deleteColumn: " + columnIndex);
    	     
    	    //process each cell
    	    var totalColumnCount = table.ColumnCount ;
    	    var totalRowCount = table.RowCount ;
    	    
    	    var i = -1;
    	    var j = -1 ;
    	    
    	    table.getAllRows().each(function(){ 
    	       i++; j=-1;
    	       var adjustColumns = 0 ;
	       $(this).children('td,th').each(function(){
	       	       j++; 
	       	       var newAdjust = 0 ;
		       try{ 
		       	       var lstr = table.isCellVoid(i,j) ;  
			       if (lstr.indexOf("X#") != -1 ) { 
				       lstr = lstr.substring(lstr.indexOf("C")+1);
				       newAdjust = parseInt(lstr) ; 
			       } 
			       adjustColumns = adjustColumns + newAdjust;
			       j = j + newAdjust ;
	       	       }catch(err){}   
	       	       
	       	       log.debug("Adjust Columns: " + adjustColumns);
		       var localCurrentCell = new Cell(this);
		       
		       //current cell needs to be deleted
		       if  (((localCurrentCell.ColumnIndex + adjustColumns) == columnIndex) && (localCurrentCell.ColumnSpan == 1) ) {
		       	       log.debug("Delete the current cell...");
		       	       $(localCurrentCell.elem).html(' ');
		       	       $(localCurrentCell.elem).width('0px');
		       }  
	       });  
	    }); 
	    
    	    table.analyze();
    	    log.debug("deleteColumn completed..."); 
    };
    
    this.mergeCell = function(direction){
		 
    	    //check current cell is empty
    	    var localCell = new Cell(this.jscell) ;
    	    var isCurrentCellEmpty = localCell.isEmpty();
    	    
    	    //calculate the cells to be merged
    	    var newCellColIndex ;
    	    var newCellRowIndex ;
    	    
    	    if (direction == this.DIRECTION.ABOVE) {
    	    	    //TODO to be completed at the end
    	    }
    	    
    	    //check wherther that cell is empty. Either one of the cell should be empty
    	    var localHTMLStr = "" ;//store the html of cell content
    	    
    	    //if true then merge the cells - delete the one and set the colspan / rowspan for other
    	    
    	    
    	    
    }; 
}

function iFrameHandler(id){
	this.id = id ;
	
	var properties = new Object(); 
	
	var localApplyProperties;
	var localCallBackFn;
	
	this.setProperty = function(key, value){
		properties[key] = value ;
		this.refresh("",true); 
	};
	
	this.getProperty = function(){return properties[key]};
	this.clearProperty = function(){properties = new Object(); };
	
	this.refresh = function(url, fnCallBack, applyProperties){
		localApplyProperties = applyProperties ;
		localCallBackFn = fnCallBack ;
		$('#' + this.id).load(this.callback);  
		$('#' + this.id).attr("src", htmlUrl ); 
	};
	
	this.refresh = function(htmlStr, applyProperties){
		if ((htmlStr != 'undefined')&&(htmlStr != "")){
			this.getDocument().body.innerHTML = htmlStr ; 
		} 
		localApplyProperties = applyProperties;
		this.callback();
	};
	
	this.callback = function(){ 
		//call back function
		if(typeof localCallBackFn === 'function') {
			    eval(localCallBackFn+"()");
		}
			  
		//apply properties
		if (localApplyProperties == true){
			
		} 
		
		//clear properties after execution
		localCallBackFn = "" ;
		localApplyProperties = false;
	};
	
	this.getDocument = function(){
		var ifrm = document.getElementById(this.id);
		ifrm = (ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;
		return ifrm.document ;
	};
	
	this.getHTMLStr = function(){
		return this.getDocument().find('html').html() ; 
	};
	
}