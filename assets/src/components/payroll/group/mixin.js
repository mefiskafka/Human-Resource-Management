export default {
	data () {
		return {
			nameSpace: 'group',
			modelName: 'Salary_Group',
			modelTransformer: 'Salary_Group_Transformer',
			isFetchRecord: false
		}
	},
	methods: {
		showHideNewRecordForm (status, experiance) {
			var experiance   = experiance || false,
			    experiance   = jQuery.isEmptyObject(experiance) ? false : experiance;

			if ( experiance ) {
			    if ( status === 'toggle' ) {
			        experiance.editMode = experiance.editMode ? false : true;
			    } else {
			        experiance.editMode = status;
			    }
			} else {

			    this.$store.commit(this.nameSpace+'/showHideNewRecordForm', status);
			}
		},

		recordDelete (deletedId, callback) {
			var self = this;

			var form_data = {
	            data: {
	            	delete: deletedId,
	            	class: this.modelName,
					method: 'delete'
	            },

	            success: function(res) {
	            	
	            	self.$store.commit(self.nameSpace + '/afterDelete', deletedId);
	            	if (typeof callback === 'function') {
	                    callback(deletedId);
	                } 
	                
	            },

	            error: function(res) {
	            	self.show_spinner = false;
	            	// Showing error
	                res.error.map( function( value, index ) {
	                    hrm.toastr.error(value);
	                });
	            }
	        };

	        this.httpRequest('hrm_delete_record', form_data);
		},

		updateRecord (args) {
			var self = this;

			var form_data = {
                data: args.data,

                beforeSend () {
                	self.loadingStart(
                		'hrm-edit-form-'+args.data.id, 
                		{animationClass: 'preloader-update-animation'}
                	);
                },

                success: function(res) {
                	self.recordMeta(res.data);

                	self.$store.commit( self.nameSpace + '/updateRecord', res.data );
                	self.loadingStop('hrm-edit-form-'+res.data.id);

                	if (typeof args.callback === 'function') {
                        args.callback(true, res);
                    } 
                    
                },

                error: function(res) {
                	
                	// Showing error
                    res.error.map( function( value, index ) {
                        hrm.toastr.error(value);
                    });

                    if (typeof args.callback === 'function') {
                        args.callback(false, res);
                    } 
                }
            };

            this.httpRequest('hrm_update_record', form_data);
		},

		addNewRecord (args) {
			var self = this;

			var form_data = {
                data: args.data,

                beforeSend () {
                	self.loadingStart(
                		'hrm-hidden-form', 
                		{animationClass: 'preloader-update-animation'}
                	);
                },

                success: function(res) {
                	self.recordMeta(res.data);
                	self.$store.commit( self.nameSpace + '/setRecord', res.data );
                	self.$store.commit( self.nameSpace + '/updatePaginationAfterNewRecord' );

                	self.loadingStop('hrm-hidden-form');

                	if (typeof args.callback !== 'undefined') {
                        args.callback(true, res);
                    } 
                    
                    hrm.Toastr.success(res.message);
                },

                error: function(res) {

                	// Showing error
                    res.error.map( function( value, index ) {
                        hrm.Toastr.error(value);
                    });

                    if (typeof args.callback === 'function') {
                        args.callback(false, res);
                    } 
                }
            };

            this.httpRequest('hrm_insert_record', form_data);
		},

		fetchRecords () {
			var self = this;

			var postData = {
				'class': this.modelName,
				'method': 'gets',
				'transformers': this.modelTransformer,
				'page': this.$route.params.current_page_number
			};
			
            var request_data = {
                data: postData,
                success: function(res) {
                	res.data.forEach(function(record) {
                		self.recordMeta(record);
                	});
                    
                    self.$store.commit( self.nameSpace + '/setRecords', res.data );
                    self.$store.commit( self.nameSpace + '/setPagination', res.meta.pagination );
                }
            };

            self.httpRequest('hrm_get_records', request_data);
		},

		filter (callback) {
			
		},

		editFormValidation (fields, postData) {
        	var isFormValidate = true;

			fields.forEach(function(val) {
				if(
					val.editable !== false
						&&
					val.required === true
						&&
					!postData[val.name]
				) {
					hrm.Toastr.error(val.label + ' is required!');
					isFormValidate = false;
				}
			});

			return isFormValidate;
        }
	}	
}