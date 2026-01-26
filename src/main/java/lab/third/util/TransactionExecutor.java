package lab.third.util;

import jakarta.persistence.EntityManager;

@FunctionalInterface
public interface TransactionExecutor {
    void executeTransaction(EntityManager manager);
}
