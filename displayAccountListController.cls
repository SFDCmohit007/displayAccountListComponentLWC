/**
* @File Name : displayAccountListController.cls
* @Description :
* @Author :
* @Last Modified By :
* @Last Modified On : October 28, 2024
* @Modification Log :
*==============================================================================
* Ver | Date | Author | Modification
*==============================================================================
* 1.0 | October 28, 2024 |   | Initial Version
**/

public with sharing class displayAccountListController {
    @AuraEnabled(cacheable=true)
    public static List<Account> fetchAccounts() {
        try {
            return [SELECT Id, Name, Industry, AnnualRevenue FROM Account LIMIT 100];
        } catch (Exception e) {
            throw new AuraHandledException('Error while fetching accounts, please contact admin');
        }
    }

    @AuraEnabled
    public static void saveAccounts(List<Account> updatedAccounts) {
        try {
            update updatedAccounts;
        } catch (Exception e) {
            throw new AuraHandledException('Error while Saving accounts, please contact admin');
        }
    }
}