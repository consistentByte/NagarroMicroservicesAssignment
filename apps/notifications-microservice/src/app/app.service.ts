import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { NotificationDataDto } from './dtos/notification-data.dto';

@Injectable()
export class AppService {
  constructor(private readonly logger: PinoLogger) {
    // set context for this service.
    this.logger.setContext(AppService.name);
  }

  getData(): { message: string } {
    this.logger.info('Successfully implemented.');
    return { message: 'Hello API' };
  }

  sendNotificationForLeaveApply(msg: NotificationDataDto) {
    // 1. Mail log for the Employee
    const employeeMail = `
      --- TO EMPLOYEE ---
      Dear ${msg.employeeName},
      This is to inform you that your leave has been applied.
      From ${msg.startDate} to ${msg.endDate}.
      It is in status ${msg.status}, and is sent to your manager ${msg.reportingManagerName} for approval.
      LeaveID: ${msg.leaveId}
      EmployeeID: ${msg.employeeId}
      Status: PENDING
      -------------------`;

    // 2. Mail log for the Manager
    const managerMail = `
      --- TO MANAGER ---
      Dear ${msg.reportingManagerName},
      This is to inform you that a leave has been applied by your team member: ${msg.employeeName}.
      From ${msg.startDate} to ${msg.endDate}.
      Please Approve/Reject it.
      EmployeeID: ${msg.employeeId}
      LeaveID: ${msg.leaveId}
      Status: PENDING
      ------------------`;

    this.logger.info(
      'Sent leave apply notification to both Employee and Manager',
    );
    // Logging the "mails"
    this.logger.info(employeeMail);
    this.logger.info(managerMail);
    return { msg: 'Notification Sent!' };
  }

  sendNotificationForLeaveApproved(msg: NotificationDataDto) {
    // 1. Mail log for the Employee
    const employeeMail = `
      --- TO EMPLOYEE ---
      Dear ${msg.employeeName},
      This is to inform you that your leave has been approved.
      LeaveID: ${msg.leaveId}
      EmployeeID: ${msg.employeeId}
      Status: APPROVED
      -------------------`;

    this.logger.info('Sent leave approval notification to Employee');
    // Logging the "mails"
    this.logger.info(employeeMail);
    return { msg: 'Notification Sent!' };
  }

  sendNotificationForLeaveRejected(msg: NotificationDataDto) {
    // 1. Mail log for the Employee
    const employeeMail = `
      --- TO EMPLOYEE ---
      Dear ${msg.employeeName},
      This is to inform you that your leave has been rejected.
      It is in status ${msg.status}, and is sent to your manager ${msg.reportingManagerName} for approval.
      LeaveID: ${msg.leaveId}
      EmployeeID: ${msg.employeeId}
      Status: REJECTED
      -------------------`;

    this.logger.info('Sent leave rejection notification to Employee');
    // Logging the "mails"
    this.logger.info(employeeMail);
    return { msg: 'Notification Sent!' };
  }

  sendNotificationForLeaveCancelled(msg: NotificationDataDto) {
    // 1. Mail log for the Employee
    const employeeMail = `
      --- TO EMPLOYEE ---
      Dear ${msg.employeeName},
      This is to inform you that your leave has been cancelled.
      LeaveID: ${msg.leaveId}
      EmployeeID: ${msg.employeeId}
      Status: CANCELLED
      -------------------`;
    const managerMail = `
      --- TO EMPLOYEE ---
      Dear ${msg.employeeName},
      This is to inform you, that your team member has cancelled the leave.
      LeaveID: ${msg.leaveId}
      EmployeeID: ${msg.employeeId}
      Status: CANCELLED
      -------------------`;

    this.logger.info('Sent leave rejection notification to Employee and Manager');
    // Logging the "mails"
    this.logger.info(employeeMail);
    this.logger.info(managerMail);
    return { msg: 'Notification Sent!' };
  }
}
