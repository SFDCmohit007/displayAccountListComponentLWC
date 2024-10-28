import { LightningElement, track, wire } from 'lwc';
import getAccounts from '@salesforce/apex/displayAccountListController.fetchAccounts';
import saveAccounts from '@salesforce/apex/displayAccountListController.saveAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const PAGE_SIZE = 10;

export default class DisplayAccountList extends LightningElement {
    @track accounts = [];
    @track columns = [
        { label: 'Account Name', fieldName: 'Name', sortable: true },
        { label: 'Industry', fieldName: 'Industry', sortable: true },
        {
            label: 'Annual Revenue',
            fieldName: 'AnnualRevenue',
            type: 'currency',
            editable: true,
            sortable: true
        }
    ];

    sortedBy;
    sortedDirection = 'asc';
    currentPage = 1;
    searchKeyword = '';
    originalData = [];

    @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            this.originalData = data;
            this.applyPagination();
        } else if (error) {
            this.showToast('Error', 'Error loading accounts', 'error');
        }
    }

    applyPagination() {
        const startIndex = (this.currentPage - 1) * PAGE_SIZE;
        this.accounts = this.originalData
            .filter((record) =>
                record.Name.toLowerCase().includes(this.searchKeyword.toLowerCase())
            )
            .slice(startIndex, startIndex + PAGE_SIZE);
    }

    handleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.originalData];
        cloneData.sort((a, b) => {
            const val1 = a[sortedBy] || '';
            const val2 = b[sortedBy] || '';
            return sortDirection === 'asc' ? val1.localeCompare(val2) : val2.localeCompare(val1);
        });
        this.originalData = cloneData;
        this.sortedBy = sortedBy;
        this.sortedDirection = sortDirection;
        this.applyPagination();
    }

    handleSearch(event) {
        this.searchKeyword = event.target.value;
        this.currentPage = 1;
        this.applyPagination();
    }

    handleNext() {
        this.currentPage++;
        this.applyPagination();
    }

    handlePrevious() {
        this.currentPage--;
        this.applyPagination();
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage * PAGE_SIZE >= this.originalData.length;
    }

    editedRecords = new Map();

    handleInlineEdit(event) {
        const { rowId, fieldName, value } = event.detail.draftValues[0];
        this.editedRecords.set(rowId, { ...this.editedRecords.get(rowId), [fieldName]: value });
    }

    async handleSave() {
        try {
            const records = Array.from(this.editedRecords.values());
            await saveAccounts({ updatedAccounts: records });
            this.showToast('Success', 'Records saved successfully', 'success');
            this.editedRecords.clear();
            return refreshApex(this.wiredAccounts);
        } catch (error) {
            this.showToast('Error', 'Failed to save records', 'error');
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}