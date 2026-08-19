import { Component } from '@angular/core';

interface BoardColumn {
  title: string;
  status: string;
  emptyMessage: string;
}

@Component({
  selector: 'app-board',
  standalone: true,
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  protected readonly columns: BoardColumn[] = [
    { title: 'To do', status: 'todo', emptyMessage: 'No tasks To do' },
    { title: 'In progress', status: 'in-progress', emptyMessage: 'No tasks in progress' },
    { title: 'Await feedback', status: 'await-feedback', emptyMessage: 'No tasks Await feedback' },
    { title: 'Done', status: 'done', emptyMessage: 'No tasks Done' },
  ];
}
