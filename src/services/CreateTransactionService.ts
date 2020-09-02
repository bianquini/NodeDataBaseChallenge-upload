import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    category,
    value,
  }: TransactionDTO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepo = getRepository(Category);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type was not expected');
    }
    if (
      type === 'outcome' &&
      (await transactionRepository.getBalance()).total < value
    ) {
      throw new AppError('Outcome greater than total balance');
    }

    let categoryDB = await categoryRepo.findOne({
      title: category,
    });

    if (!categoryDB) {
      categoryDB = await categoryRepo.save(new Category(category));
    }

    const repository = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryDB.id,
    });
    return transactionRepository.save(repository);
  }
}

export default CreateTransactionService;
