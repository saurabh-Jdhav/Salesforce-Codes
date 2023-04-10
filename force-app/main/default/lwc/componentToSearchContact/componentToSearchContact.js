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
  searchKey;     // Initializing searchKey variable
  // this function will get value from text input
  handleInputChange(event) {
    let searchKeys = event.target.value;
    this.searchKey = searchKeys;      // setting the value of the search key variable with the input value
    //window.console.log('Search Key: ',event.target.value);
  }
  // Retrieving contactList by calling wire with the Apex method and searchKey parameter
  @wire(searchContacts, {textKey : '$searchKey'}) contactList;
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
  callRowAction(event) {
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
        this[NavigationMixin.Navigate]({
          type: 'standard__recordPage',
          attributes: {
            recordId: row.Id,
            objectApiName: 'Contact',
            actionName: 'edit'
          }
        });
        return refreshApex(this.contactList); // Refreshing contactList after editing the record
        break;
     case 'delete':
        this.delContact();
        return refreshApex(this.contactList);
        break;
    }
  }
  //This function created for deleting the record
  delContact() {
    //Invoke the deleteRecord to delete a record
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
            title: 'Sorry',
            message: 'Cannot delete this record since it is associated with a case',
            variant: 'error'
          })
        );
      });
  }
}