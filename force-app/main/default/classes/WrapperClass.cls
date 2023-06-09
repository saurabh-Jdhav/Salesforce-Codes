public with sharing class WrapperClass {
      /* method decorated with "@AuraEnabled(Cacheable=true)" that accepts a string parameter "keyWord"
      and returns a list of "ContactWrapper" objects. */
      /*@AuraEnabled: Method can be called from an Aura component and for the response to be processed by JavaScript
      (Cacheable=true): will save query result in cache memory of browser */
      @AuraEnabled(Cacheable=true)
      public static List<ContactWrapper> searchContacts(String keyWord)
      {
        // Concatenate the wildcard search term "%" search using one keyword only or multiple keyword
        keyWord = '%'+ keyWord +'%';
        // New list to hold the "ContactWrapper" objects
        List<ContactWrapper> objWrapperContact = new List<ContactWrapper>();
        // retrieve a list of up to 10 records whose "Name" field matches the "keyWord" search term
        List<Contact> objContact = [SELECT Name, Email, MobilePhone,
                                  Account.BillingCity, Account.BillingState
                                  FROM Contact
                                  WHERE Name LIKE: keyWord
                                  OR  Email LIKE: keyWord
                                  OR  MobilePhone LIKE: keyWord
                                  OR  Account.BillingCity LIKE: keyWord
                                  OR  Account.BillingState LIKE: keyWord
                                  LIMIT 10];
        for(Contact con :objContact )
        {
          // Create a new "ContactWrapper" object for each Contact record
          ContactWrapper newWrp = new ContactWrapper();
          /* Assign the values of some fields from the Contact and its related Account
          to the corresponding fields of the ContactWrapper object */
          newWrp.Id = con.Id;
          newWrp.Name = con.Name;
          newWrp.Email = con.Email;
          newWrp.MobilePhone = con.MobilePhone;
          newWrp.BillingCity = con.Account.BillingCity;
          newWrp.BillingState = con.Account.BillingState;
          // Add the ContactWrapper object to the list
          objWrapperContact.add(newWrp);
        }
        return objWrapperContact;
      }
      // This is a nested class named "ContactWrapper"
      public class ContactWrapper
      {
        /* These are the fields of the "ContactWrapper" class decorated with "@AuraEnabled"
        to make them available for Lightning component data binding */
        @AuraEnabled
        public Id Id { get; set; }
        @AuraEnabled
        public String Name { get; set; }
        @AuraEnabled
        public String Email { get; set; }
        @AuraEnabled
        public String MobilePhone {get; set;}
        @AuraEnabled
        public String BillingCity { get; set; }
        @AuraEnabled
        public String BillingState { get; set; }
      }
    }
    