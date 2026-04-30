// src/utils/pdfGenerator.js

export const generateTaskHtml = (task, id, formatDateTime) => {
    return `
        <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                    .header { border-bottom: 2px solid #2F80ED; padding-bottom: 10px; margin-bottom: 20px; }
                    .title { fontSize: 24px; font-weight: bold; margin: 0; }
                    .id { color: #888; font-size: 12px; }
                    .section { margin-bottom: 20px; padding: 15px; border-radius: 10px; background-color: #F0F7FF; }
                    .label { font-weight: bold; color: #003366; width: 150px; display: inline-block; }
                    .row { margin-bottom: 8px; border-bottom: 1px solid #E1E9F5; padding-bottom: 4px; }
                    .status { font-weight: bold; }
                    .desc { line-height: 1.5; white-space: pre-wrap; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="title">${task.name}</h1>
                    <p class="id">Task ID: ${id.toUpperCase()}</p>
                </div>

                <div class="section">
                    <h3>Task Information</h3>
                    <div class="row"><span class="label">Status:</span> <span class="status">${task.status}</span></div>
                    <div class="row"><span class="label">Priority:</span> <span>${task.priority}</span></div>
                    <div class="row"><span class="label">Customer:</span> <span>${task.customer}</span></div>
                    <div class="row"><span class="label">Location:</span> <span>${task.location}</span></div>
                    <div class="row"><span class="label">Category:</span> <span>${task.categoryName}</span></div>
                    <div class="row"><span class="label">Created By:</span> <span>${task.creatorName}</span></div>
                    <div class="row"><span class="label">Due Date:</span> <span>${formatDateTime(task.dueDate)}</span></div>
                </div>

                <div class="section" style="background-color: #F8FAFC;">
                    <h3>Description</h3>
                    <p class="desc">${task.taskDescription}</p>
                </div>

                <div class="section">
                    <h3>Assigned Engineers</h3>
                    <p>${task.assignedTo?.join(', ') || 'None'}</p>
                </div>

                <p style="text-align: center; font-size: 10px; color: #999; margin-top: 50px;">
                    Generated on ${new Date().toLocaleString()}
                </p>
            </body>
        </html>
    `;
};