import { LightningElement, wire} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import searchContacts from '@salesforce/apex/WrapperClass.searchContacts';
//defining actions for each row of the table
const actions = [
          { label: 'View', name: 'view' },
          { label: 'Edit', name: 'edit' },
          { label: 'Delete', name: 'delete' }
        ];
//defining columns for the table
const COLUMNS = [
          { label: 'Name', fieldName: 'Name', type: 'text'},
          { label: 'Email', fieldName: 'Email', type: 'email' },
          { label: 'Mobile', fieldName: 'MobilePhone', type: 'phone' },
          { label: 'Billing City', fieldName: 'BillingCity', type: 'text' },
          { label: 'Billing State', fieldName: 'BillingState', type: 'text' },
          { label: '', type: 'action', typeAttributes: { rowActions: actions }, }
        ];
export default class ContactTable extends NavigationMixin(LightningElement) {
  columns = COLUMNS; // Initializing columns with defined values
  contactList;    // Initializing contactList variable
  contactSearch;     // Initializing contactSearch variable
  // this function will get value from text input
  errorEdit;
  handleSearchEvent(event) {
    let contactSearchs = event.target.value;
    // setting the value of the search key variable with the input value
    if(contactSearchs === '')
    {
      this.contactList=[];
    }
    else{
      this.contactSearch = contactSearchs;
      return refreshApex(this.contactList);
    }
  }
  // Retrieving contactList by calling wire with the Apex method and contactSearch parameter
  @wire(searchContacts, {keyWord : '$contactSearch'}) contactList;
  //This function will create a new contact
  handleContactCreate() {
    this[NavigationMixin.Navigate]({
      type: 'standard__objectPage',
      attributes:
      {
        objectApiName: 'Contact',
        actionName: 'new'
      }
    });
  }
  //This function will return view, edit, delete the record based what will select in action
  crudActions(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;
    this.recordId = row.Id;
    switch (actionName) {
      case 'view':
        this[NavigationMixin.Navigate]({
          type: 'standard__recordPage',
          attributes: {
            recordId: row.Id,
            actionName: 'view'
          }
        });
        break;
      case 'edit':
          this.navigateToEditPage(row);
          
          return refreshApex(this.contactList);       
     case 'delete':
        this.delContact();
        return refreshApex(this.contactList); // Record will be deleted
    }
  }
  //deleting the record
  delContact() {
    //method call to delete a record
    deleteRecord(this.recordId)
      .then(() => {
        // We are firing a toast message
        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Success',
            message: 'Record is successfully deleted',
            variant: 'success'
          })
        );
        return refreshApex(this.contactList);
      })
      .catch((error) => {
        console.log(error);
        this.dispatchEvent(
          new ShowToastEvent({
            title: 'ERROR',
            message: 'Cannot delete this record since it is associated with a case',
            variant: 'error'
          })
        );
      });
  }
  
  async navigateToEditPage(row){
  try {
    await this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: row.Id,
        objectApiName: 'Contact',
        actionName: 'edit'
      }
  });
    this.contactList= await refreshApex(this.contactList);
    
  }
  catch(error){
    this.error = error;
  }
  
}
}

/*
        edit
        this[NavigationMixin.Navigate]({
          type: 'standard__recordPage',
          attributes: {
            recordId: row.Id,
            objectApiName: 'Contact',
            actionName: 'edit'
          }
*/
/*refreshApex()
  {
    return Promise.all([
      eval("$A.get('e.force:refreshView').fire()"),
      new Promise((resolve) => setTimeout(resolve,10))
    ])
  }*/